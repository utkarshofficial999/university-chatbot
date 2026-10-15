import re
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from backend.app.core.config import settings
from backend.app.db.vector_store import vector_store
from backend.app.ingestion.pipeline import generate_embeddings

class HybridSearchEngine:
    """
    Combines Dense Vector Search and BM25 Sparse Keyword Search using Reciprocal Rank Fusion (RRF).
    """
    def __init__(self):
        self._bm25_corpus: List[Dict[str, Any]] = []
        self._bm25_model: Optional[BM25Okapi] = None
        self._rebuild_bm25_index()

    def _tokenize(self, text: str) -> List[str]:
        # Lowercase alphanumeric tokenization
        return re.findall(r'\b[a-zA-Z0-9_-]+\b', text.lower())

    def _rebuild_bm25_index(self):
        chunks = vector_store.chunks
        if not chunks:
            self._bm25_corpus = []
            self._bm25_model = None
            return

        self._bm25_corpus = list(chunks)
        tokenized_corpus = [
            self._tokenize(f"{c.get('document_title', '')} {c.get('content', '')}")
            for c in self._bm25_corpus
        ]
        self._bm25_model = BM25Okapi(tokenized_corpus)

    COMMON_TYPOS = {
        "attendace": "attendance",
        "attendence": "attendance",
        "attandance": "attendance",
        "hostle": "hostel",
        "hostal": "hostel",
        "exmination": "examination",
        "examintaion": "examination",
        "addmission": "admission",
        "admisson": "admission",
        "placment": "placement",
        "placemnt": "placement",
        "schlarship": "scholarship",
        "scolorship": "scholarship",
        "libary": "library",
        "libray": "library",
        "ragging": "anti-ragging",
        "critaria": "criteria",
        "crteria": "criteria"
    }

    def _normalize_query(self, query: str) -> str:
        words = query.split()
        fixed = [self.COMMON_TYPOS.get(w.lower().strip("?!.,;:"), w) for w in words]
        normalized = " ".join(fixed)
        if "attendance" in normalized.lower() and "absent" not in normalized.lower():
            normalized += " absence absenteeism leave penalty"
        return normalized

    def search(
        self,
        query: str,
        top_k_vector: int = 8,
        top_k_bm25: int = 8,
        university_id: str = "abes",
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        # Always make sure BM25 index has current chunks
        if len(self._bm25_corpus) != len(vector_store.chunks):
            self._rebuild_bm25_index()

        cleaned_query = self._normalize_query(query)

        # 1. Dense Vector Search
        query_embs = generate_embeddings([cleaned_query])
        vector_results = []
        if query_embs:
            vector_results = vector_store.search(
                query_embedding=query_embs[0],
                top_k=top_k_vector,
                university_id=university_id,
                category=category
            )

        # 2. Sparse BM25 Keyword Search
        bm25_results = []
        if self._bm25_model and self._bm25_corpus:
            query_tokens = self._tokenize(cleaned_query)
            if query_tokens:
                scores = self._bm25_model.get_scores(query_tokens)
                ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
                
                count = 0
                for idx in ranked_indices:
                    if scores[idx] <= 0:
                        break
                    chunk = self._bm25_corpus[idx]
                    if chunk.get("university_id") and chunk.get("university_id") != university_id:
                        continue
                    if category and chunk.get("category") and chunk.get("category").lower() != category.lower():
                        continue
                    bm25_results.append({
                        **chunk,
                        "bm25_score": float(scores[idx])
                    })
                    count += 1
                    if count >= top_k_bm25:
                        break

        # 3. Reciprocal Rank Fusion (RRF)
        # RRF formula: RRF_score(d) = sum(1 / (k + rank_i(d)))
        rrf_constant = 60
        combined: Dict[str, Dict[str, Any]] = {}

        for rank, item in enumerate(vector_results):
            cid = item.get("chunk_id") or f"{item.get('document_id')}_{item.get('chunk_index')}"
            if cid not in combined:
                combined[cid] = {**item, "rrf_score": 0.0, "vector_rank": rank + 1, "bm25_rank": None}
            combined[cid]["rrf_score"] += 1.0 / (rrf_constant + rank + 1)

        for rank, item in enumerate(bm25_results):
            cid = item.get("chunk_id") or f"{item.get('document_id')}_{item.get('chunk_index')}"
            if cid not in combined:
                combined[cid] = {**item, "rrf_score": 0.0, "vector_rank": None, "bm25_rank": rank + 1}
            else:
                combined[cid]["bm25_rank"] = rank + 1
            combined[cid]["rrf_score"] += 1.0 / (rrf_constant + rank + 1)

        # 4. Version recency booster
        for cid, item in combined.items():
            version = str(item.get("version_year", ""))
            if "2025" in version or "2026" in version or "2027" in version:
                item["rrf_score"] *= 1.15  # 15% priority boost for recent policies

        fused_list = list(combined.values())
        fused_list.sort(key=lambda x: x["rrf_score"], reverse=True)
        return fused_list
