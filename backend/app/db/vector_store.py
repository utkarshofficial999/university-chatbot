import os
import json
import numpy as np
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

class LocalVectorStore:
    """
    Lightweight, high-performance in-process vector store using NumPy cosine similarity.
    Persists embeddings to disk.
    """
    def __init__(self, storage_path: str = "./data/vectors/vector_index.json"):
        self.storage_path = os.path.abspath(storage_path)
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings_matrix: Optional[np.ndarray] = None
        self._load()

    def _load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.chunks = data.get("chunks", [])
                    raw_vecs = data.get("vectors", [])
                    if raw_vecs:
                        self.embeddings_matrix = np.array(raw_vecs, dtype=np.float32)
                        norms = np.linalg.norm(self.embeddings_matrix, axis=1, keepdims=True)
                        norms[norms == 0] = 1e-10
                        self.embeddings_matrix = self.embeddings_matrix / norms
            except Exception as e:
                print(f"[LocalVectorStore] Error loading index: {e}")
                self.chunks = []
                self.embeddings_matrix = None

    def _save(self):
        try:
            vectors_list = self.embeddings_matrix.tolist() if self.embeddings_matrix is not None else []
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump({
                    "chunks": self.chunks,
                    "vectors": vectors_list
                }, f)
        except Exception as e:
            print(f"[LocalVectorStore] Error saving index: {e}")

    def add_chunks(self, new_chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        if not new_chunks or not embeddings:
            return
        
        new_vecs = np.array(embeddings, dtype=np.float32)
        norms = np.linalg.norm(new_vecs, axis=1, keepdims=True)
        norms[norms == 0] = 1e-10
        new_vecs = new_vecs / norms
        
        doc_ids_to_replace = set(c.get("document_id") for c in new_chunks if c.get("document_id"))
        if doc_ids_to_replace and self.chunks:
            keep_indices = [i for i, c in enumerate(self.chunks) if c.get("document_id") not in doc_ids_to_replace]
            self.chunks = [self.chunks[i] for i in keep_indices]
            if self.embeddings_matrix is not None and len(keep_indices) > 0:
                self.embeddings_matrix = self.embeddings_matrix[keep_indices]
            else:
                self.embeddings_matrix = None

        if self.embeddings_matrix is None or len(self.chunks) == 0:
            self.embeddings_matrix = new_vecs
            self.chunks = list(new_chunks)
        else:
            self.embeddings_matrix = np.vstack([self.embeddings_matrix, new_vecs])
            self.chunks.extend(new_chunks)
            
        self._save()

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        university_id: str = "abes",
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if self.embeddings_matrix is None or len(self.chunks) == 0:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        norm = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec = q_vec / norm

        similarities = np.dot(self.embeddings_matrix, q_vec)
        
        results = []
        for idx, score in enumerate(similarities):
            chunk = self.chunks[idx]
            if chunk.get("university_id") and chunk.get("university_id") != university_id:
                continue
            if category and chunk.get("category") and chunk.get("category").lower() != category.lower():
                continue
            results.append({
                **chunk,
                "similarity_score": float(score)
            })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def delete_document(self, document_id: str):
        if not self.chunks:
            return
        keep_indices = [i for i, c in enumerate(self.chunks) if c.get("document_id") != document_id]
        if len(keep_indices) == len(self.chunks):
            return
        self.chunks = [self.chunks[i] for i in keep_indices]
        if self.embeddings_matrix is not None and len(keep_indices) > 0:
            self.embeddings_matrix = self.embeddings_matrix[keep_indices]
        else:
            self.embeddings_matrix = None
        self._save()

    def count(self, university_id: str = "abes") -> int:
        if not self.chunks:
            return 0
        return sum(1 for c in self.chunks if c.get("university_id", "abes") == university_id)


class PineconeVectorStore:
    """
    Production-ready Vector Store backed by Pinecone Serverless.
    Also syncs with local cache for BM25 sparse keyword indexing and instant fallback.
    """
    def __init__(self, api_key: str, index_name: str):
        self.api_key = api_key
        self.index_name = index_name
        self.local_fallback = LocalVectorStore()
        self.index = None
        self._init_pinecone()

    def _init_pinecone(self):
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=self.api_key)
            self.index = pc.Index(self.index_name)
            print(f"[Pinecone] Connected to index '{self.index_name}' successfully.")
        except Exception as e:
            print(f"[Pinecone] Connection warning, using local fallback: {e}")
            self.index = None

    @property
    def chunks(self) -> List[Dict[str, Any]]:
        # Used by BM25 keyword indexer
        return self.local_fallback.chunks

    def add_chunks(self, new_chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        # 1. Update local cache
        self.local_fallback.add_chunks(new_chunks, embeddings)

        # 2. Upload to Pinecone
        if self.index is not None and new_chunks and embeddings:
            try:
                vectors_to_upsert = []
                for i, chunk in enumerate(new_chunks):
                    cid = str(chunk.get("chunk_id") or f"{chunk.get('document_id')}_{chunk.get('chunk_index')}")
                    # Ensure clean standard python floats for Pinecone json serialization
                    clean_vec = [float(val) for val in embeddings[i]]
                    
                    metadata = {
                        "chunk_id": cid,
                        "document_id": str(chunk.get("document_id", "")),
                        "document_title": str(chunk.get("document_title", "")),
                        "filename": str(chunk.get("filename", "")),
                        "page_number": int(chunk.get("page_number", 1)),
                        "chunk_index": int(chunk.get("chunk_index", 0)),
                        "category": str(chunk.get("category", "General")),
                        "version_year": str(chunk.get("version_year", "2025-26")),
                        "university_id": str(chunk.get("university_id", "abes")),
                        "context_header": str(chunk.get("context_header", "")),
                        "content": str(chunk.get("content", ""))[:950]
                    }
                    vectors_to_upsert.append({
                        "id": cid,
                        "values": clean_vec,
                        "metadata": metadata
                    })

                # Batch upsert (batches of 100)
                batch_size = 100
                for start_idx in range(0, len(vectors_to_upsert), batch_size):
                    batch = vectors_to_upsert[start_idx : start_idx + batch_size]
                    self.index.upsert(vectors=batch)
                print(f"[Pinecone] Successfully upserted {len(vectors_to_upsert)} chunks to index '{self.index_name}'.")
            except Exception as e:
                print(f"[Pinecone] Upsert error: {e}")

    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        university_id: str = "abes",
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if self.index is not None:
            try:
                clean_query = [float(v) for v in query_embedding]
                filter_dict: Dict[str, Any] = {"university_id": university_id}
                if category and category.lower() != "all":
                    filter_dict["category"] = category

                response = self.index.query(
                    vector=clean_query,
                    top_k=top_k,
                    include_metadata=True,
                    filter=filter_dict
                )
                
                results = []
                for match in response.matches:
                    meta = match.metadata or {}
                    results.append({
                        "chunk_id": match.id,
                        "document_id": meta.get("document_id"),
                        "document_title": meta.get("document_title"),
                        "filename": meta.get("filename"),
                        "page_number": meta.get("page_number", 1),
                        "chunk_index": meta.get("chunk_index", 0),
                        "category": meta.get("category", "General"),
                        "version_year": meta.get("version_year", "2025-26"),
                        "university_id": meta.get("university_id", university_id),
                        "content": meta.get("content", ""),
                        "context_header": meta.get("context_header", ""),
                        "similarity_score": float(match.score)
                    })
                if results:
                    return results
            except Exception as e:
                print(f"[Pinecone] Query failed, using local: {e}")

        return self.local_fallback.search(query_embedding, top_k, university_id, category)

    def delete_document(self, document_id: str):
        self.local_fallback.delete_document(document_id)
        if self.index is not None:
            try:
                self.index.delete(filter={"document_id": {"$eq": document_id}})
            except Exception:
                pass

    def count(self, university_id: str = "abes") -> int:
        if self.index is not None:
            try:
                stats = self.index.describe_index_stats()
                return stats.total_vector_count
            except Exception:
                pass
        return self.local_fallback.count(university_id)


# Factory function
if settings.PINECONE_API_KEY and settings.PINECONE_INDEX_NAME:
    vector_store = PineconeVectorStore(
        api_key=settings.PINECONE_API_KEY,
        index_name=settings.PINECONE_INDEX_NAME
    )
else:
    vector_store = LocalVectorStore()
