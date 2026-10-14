import os
import re
from typing import List, Dict, Any
from pypdf import PdfReader

class PDFExtractor:
    """
    Extracts text page-by-page from PDF documents, capturing page numbers and structure.
    """
    @staticmethod
    def extract_pages(pdf_path: str) -> List[Dict[str, Any]]:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File not found: {pdf_path}")
        
        reader = PdfReader(pdf_path)
        pages_data = []
        
        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            raw_text = page.extract_text() or ""
            
            # Clean up text
            cleaned_text = re.sub(r'\s+', ' ', raw_text).strip()
            
            if cleaned_text:
                pages_data.append({
                    "page_number": page_num,
                    "text": cleaned_text
                })
                
        return pages_data
