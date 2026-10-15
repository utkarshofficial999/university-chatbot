import re
from typing import List, Dict, Any

class Reranker:
    """
    Reranks candidate chunks based on composite relevance, query overlap, and version recency.
    """
    @staticmethod
    def rerank(
        query: str,
        candidates: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        query_terms = set(re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', query.lower()))
        
        reranked = []
        for c in candidates:
            content_lower = f"{c.get('document_title', '')} {c.get('content', '')}".lower()
            
            # Exact term match ratio
            matched_terms = [t for t in query_terms if t in content_lower]
            overlap_ratio = len(matched_terms) / max(1, len(query_terms))
            
            # Base score from RRF
            rrf_score = c.get("rrf_score", 0.0)
            
            # Similarity score if available
            sim_score = c.get("similarity_score", 0.0)
            
            # Composite calibrated relevance score
            composite_score = (rrf_score * 30.0) + (overlap_ratio * 0.4) + (sim_score * 0.3)
            
            # Recency factor
            version = str(c.get("version_year", ""))
            if "2025" in version or "2026" in version or "2027" in version:
                composite_score *= 1.1

            # Normalize to 0.0 - 1.0 confidence score
            confidence = min(0.99, max(0.40, composite_score))

            reranked.append({
                **c,
                "confidence_score": round(confidence, 3),
                "matched_terms": matched_terms
            })

        reranked.sort(key=lambda x: x["confidence_score"], reverse=True)

        # Deduplicate identical or near-identical chunks from repeated ingestion runs
        deduped = []
        seen_texts = set()
        for c in reranked:
            norm = "".join(c.get("content", "").split())[:90].lower()
            if norm and norm not in seen_texts:
                seen_texts.add(norm)
                deduped.append(c)

        return deduped[:top_k]
