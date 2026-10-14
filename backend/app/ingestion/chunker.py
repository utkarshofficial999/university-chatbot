import re
from typing import List, Dict, Any

class DocumentChunker:
    """
    Splits extracted pages into semantic chunks with context headers and overlap.
    """
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @staticmethod
    def extract_version_year(filename: str, text_sample: str = "") -> str:
        # Detect patterns like 2025-27, 2024-26, 2024-25, 2026
        combined = f"{filename} {text_sample[:500]}"
        match = re.search(r'(202[0-9]-(?:2[0-9]|[0-9]{2}))|(202[0-9])', combined)
        if match:
            return match.group(0)
        return "2025-26"

    def chunk_pages(
        self,
        pages_data: List[Dict[str, Any]],
        document_title: str,
        document_id: str,
        category: str = "General",
        version_year: str = "2025-26",
        university_id: str = "jaipuria"
    ) -> List[Dict[str, Any]]:
        chunks = []
        global_chunk_idx = 0

        for page_info in pages_data:
            page_num = page_info["page_number"]
            page_text = page_info["text"]

            if not page_text or len(page_text.strip()) == 0:
                continue

            # Split by paragraphs or sentences
            paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
            if not paragraphs:
                paragraphs = [page_text]

            current_chunk_words = []
            current_len = 0

            for para in paragraphs:
                words = para.split(" ")
                for word in words:
                    current_chunk_words.append(word)
                    current_len += len(word) + 1

                    if current_len >= self.chunk_size:
                        chunk_text = " ".join(current_chunk_words).strip()
                        
                        chunks.append({
                            "chunk_id": f"{document_id}_{global_chunk_idx}",
                            "document_id": document_id,
                            "document_title": document_title,
                            "chunk_index": global_chunk_idx,
                            "page_number": page_num,
                            "content": chunk_text,
                            "token_count": len(current_chunk_words),
                            "category": category,
                            "version_year": version_year,
                            "university_id": university_id,
                            "context_header": f"Document: {document_title} | Version: {version_year} | Page: {page_num}"
                        })
                        global_chunk_idx += 1

                        # Retain overlap words
                        overlap_words = current_chunk_words[-max(1, int(self.chunk_overlap / 6)):]
                        current_chunk_words = list(overlap_words)
                        current_len = sum(len(w) + 1 for w in current_chunk_words)

            if current_chunk_words:
                chunk_text = " ".join(current_chunk_words).strip()
                if len(chunk_text) > 30: # Ignore tiny noise
                    chunks.append({
                        "chunk_id": f"{document_id}_{global_chunk_idx}",
                        "document_id": document_id,
                        "document_title": document_title,
                        "chunk_index": global_chunk_idx,
                        "page_number": page_num,
                        "content": chunk_text,
                        "token_count": len(current_chunk_words),
                        "category": category,
                        "version_year": version_year,
                        "university_id": university_id,
                        "context_header": f"Document: {document_title} | Version: {version_year} | Page: {page_num}"
                    })
                    global_chunk_idx += 1

        return chunks
