import os
import re
from typing import List, Dict, Any
from pypdf import PdfReader
from backend.app.core.config import settings

class PDFExtractor:
    """
    Extracts text page-by-page from PDF documents, capturing page numbers and structure.
    If a page has no selectable text but contains images (e.g., scanned circulars/calendars),
    it automatically falls back to multimodal OCR using Gemini to transcribe the document.
    """
    @staticmethod
    def extract_pages(pdf_path: str) -> List[Dict[str, Any]]:
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File not found: {pdf_path}")
        
        reader = PdfReader(pdf_path)
        pages_data = []
        
        gemini_client = None
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"[PDFExtractor] Note initializing Gemini OCR client: {e}")

        for idx, page in enumerate(reader.pages):
            page_num = idx + 1
            raw_text = page.extract_text() or ""
            
            # Clean up text
            cleaned_text = re.sub(r'\s+', ' ', raw_text).strip()
            
            # If text is too sparse (< 50 chars) and page has images, run OCR
            if len(cleaned_text) < 50 and getattr(page, 'images', None) and len(page.images) > 0 and gemini_client:
                print(f"[PDFExtractor] Page {page_num} has scanned images ({len(page.images)}). Running Gemini OCR...")
                try:
                    from google.genai import types
                    img = page.images[0]
                    res = gemini_client.models.generate_content(
                        model="gemini-3.5-flash-lite",
                        contents=[
                            types.Part.from_bytes(data=img.data, mime_type="image/jpeg"),
                            "You are an expert OCR transcription engine. Transcribe all text, tables, dates, deadlines, schedules, notices, titles, and details from this official academic document with 100% precision. Output clean markdown tables and exact dates."
                        ]
                    )
                    if res and res.text:
                        cleaned_text = res.text.strip()
                        print(f"[PDFExtractor] Page {page_num} OCR transcribed {len(cleaned_text)} characters.")
                except Exception as ocr_err:
                    print(f"[PDFExtractor] Gemini OCR failed for page {page_num}: {ocr_err}")

            if cleaned_text:
                pages_data.append({
                    "page_number": page_num,
                    "text": cleaned_text
                })
                
        return pages_data

