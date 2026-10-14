from typing import Dict, Any, List, AsyncGenerator, Optional
from backend.app.core.prompts import (
    JAIPURIA_SYSTEM_PROMPT,
    JAIPURIA_USER_PROMPT_TEMPLATE,
    UNKNOWN_FALLBACK_TEXT
)
from backend.app.rag.hybrid_search import HybridSearchEngine
from backend.app.rag.reranker import Reranker
from backend.app.rag.llm_client import llm_client

class RAGEngine:
    def __init__(self):
        self.search_engine = HybridSearchEngine()
        self.reranker = Reranker()

    def retrieve_context(
        self,
        query: str,
        university_id: str = "jaipuria",
        category: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        # 1. Hybrid Search (Vector + BM25)
        candidates = self.search_engine.search(
            query=query,
            top_k_vector=8,
            top_k_bm25=8,
            university_id=university_id,
            category=category
        )

        if not candidates:
            return []

        # 2. Reranking
        ranked_chunks = self.reranker.rerank(
            query=query,
            candidates=candidates,
            top_k=top_k
        )
        return ranked_chunks

    def build_citations(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        seen = set()
        for c in chunks:
            key = f"{c.get('document_id')}_{c.get('page_number')}"
            if key in seen:
                continue
            seen.add(key)
            citations.append({
                "document_id": c.get("document_id"),
                "document_title": c.get("document_title"),
                "filename": c.get("filename"),
                "page_number": c.get("page_number"),
                "version_year": c.get("version_year"),
                "category": c.get("category"),
                "confidence_score": c.get("confidence_score", 0.8),
                "snippet": c.get("content", "")[:280] + "..." if len(c.get("content", "")) > 280 else c.get("content", "")
            })
        return citations

    async def query_stream(
        self,
        query: str,
        university_id: str = "jaipuria",
        category: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Yields events:
        {'type': 'citations', 'data': [...]}
        {'type': 'token', 'data': 'token'}
        {'type': 'done'}
        """
        chunks = self.retrieve_context(
            query=query,
            university_id=university_id,
            category=category
        )

        # AI Safety Guardrail: Check if context is sufficiently relevant
        if not chunks or (chunks and chunks[0].get("confidence_score", 0) < 0.42):
            yield {"type": "citations", "data": []}
            yield {"type": "token", "data": UNKNOWN_FALLBACK_TEXT}
            yield {"type": "done"}
            return

        citations = self.build_citations(chunks)
        yield {"type": "citations", "data": citations}

        # Format context for system prompt
        context_blocks = []
        for c in chunks:
            header = f"[Document: {c.get('document_title')} | Version: {c.get('version_year')} | Page {c.get('page_number')}]"
            context_blocks.append(f"{header}\n{c.get('content')}")
        
        retrieved_context_str = "\n\n---\n\n".join(context_blocks)
        user_prompt = JAIPURIA_USER_PROMPT_TEMPLATE.format(
            retrieved_context=retrieved_context_str,
            user_query=query
        )

        async for token in llm_client.generate_stream(
            system_prompt=JAIPURIA_SYSTEM_PROMPT,
            user_prompt=user_prompt
        ):
            yield {"type": "token", "data": token}

        yield {"type": "done"}

    async def query_sync(
        self,
        query: str,
        university_id: str = "jaipuria",
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        chunks = self.retrieve_context(
            query=query,
            university_id=university_id,
            category=category
        )

        if not chunks or (chunks and chunks[0].get("confidence_score", 0) < 0.42):
            return {
                "answer": UNKNOWN_FALLBACK_TEXT,
                "citations": []
            }

        citations = self.build_citations(chunks)
        context_blocks = []
        for c in chunks:
            header = f"[Document: {c.get('document_title')} | Version: {c.get('version_year')} | Page {c.get('page_number')}]"
            context_blocks.append(f"{header}\n{c.get('content')}")
        
        retrieved_context_str = "\n\n---\n\n".join(context_blocks)
        user_prompt = JAIPURIA_USER_PROMPT_TEMPLATE.format(
            retrieved_context=retrieved_context_str,
            user_query=query
        )

        answer = await llm_client.generate_sync(
            system_prompt=JAIPURIA_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )

        return {
            "answer": answer,
            "citations": citations
        }

rag_engine = RAGEngine()
