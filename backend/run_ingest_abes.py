"""
Official Ingestion Script for ABES Engineering College Knowledge Base
Parses and indexes:
1. ABES_Student_Handbook.pdf (41 pages)
2. ABES_Quick_Reference_Guide.pdf (1 page)
3. ABES_Knowledge_Base.json (25 structured records)
"""

import sys
import os
import json
import uuid

# Add parent directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal, init_db
from backend.app.db.models import Document, DocumentChunk
from backend.app.db.vector_store import vector_store
from backend.app.ingestion.pipeline import IngestionPipeline, generate_embeddings

CATEGORY_MAP = {
    "overview": "Academic & Curriculum",
    "programmes": "Admission & Programmes",
    "admission": "Admission & Programmes",
    "fees": "Fees & Scholarships",
    "attendance": "Academic & Curriculum",
    "anti_ragging": "Discipline & Anti-Ragging",
    "harassment": "Discipline & Anti-Ragging",
    "grievance": "Discipline & Anti-Ragging",
    "hostel": "Hostel & Facilities",
    "facilities": "Hostel & Facilities",
    "placement": "Placement & Career",
    "clubs": "Clubs & Student Societies",
    "support": "Hostel & Facilities",
    "national": "Discipline & Anti-Ragging",
    "generic": "Academic & Curriculum"
}

def run():
    print("=" * 65)
    print("  ABES ENGINEERING COLLEGE - KNOWLEDGE INGESTION PIPELINE")
    print("=" * 65)

    init_db()
    db = SessionLocal()
    pipeline = IngestionPipeline(db)

    univ_id = "abes"
    version_year = "2025-26"
    workspace_dir = parent_dir

    total_chunks = 0

    # 1. Ingest ABES_Knowledge_Base.json
    json_path = os.path.join(workspace_dir, "ABES_Knowledge_Base.json")
    if os.path.exists(json_path):
        print("\n[1/3] Processing ABES_Knowledge_Base.json (25 verified records)...")
        with open(json_path, "r", encoding="utf-8") as f:
            kb_data = json.load(f)
        
        doc_id = str(uuid.uuid4())
        doc = Document(
            id=doc_id,
            title="ABES Official Knowledge Base Directory",
            filename="ABES_Knowledge_Base.json",
            category="Academic & Curriculum",
            version_year=version_year,
            university_id=univ_id,
            file_path=json_path,
            total_pages=len(kb_data.get("records", []))
        )
        db.add(doc)
        db.commit()

        kb_chunks = []
        for idx, rec in enumerate(kb_data.get("records", []), 1):
            cat_raw = rec.get("category", "overview")
            mapped_cat = CATEGORY_MAP.get(cat_raw, "Academic & Curriculum")
            title = rec.get("title", "")
            text = rec.get("text", "")
            source_url = rec.get("source_url", "")
            caveat = rec.get("caveat", "")
            verification = rec.get("verification_status", "verified")

            content = (
                f"ABES Engineering College — {title} ({mapped_cat})\n"
                f"{text}\n"
                f"Verification: {verification} | Source: {source_url}"
            )
            if caveat:
                content += f" | Note: {caveat}"

            chunk_id = str(uuid.uuid4())
            chunk_row = DocumentChunk(
                id=chunk_id,
                document_id=doc_id,
                chunk_index=idx,
                page_number=idx,
                content=content,
                metadata_json={"context_header": f"[ABES Engineering College: {title}]"},
                university_id=univ_id
            )
            db.add(chunk_row)
            kb_chunks.append({
                "chunk_id": chunk_id,
                "document_id": doc_id,
                "document_title": doc.title,
                "filename": doc.filename,
                "page_number": idx,
                "chunk_index": idx,
                "category": mapped_cat,
                "version_year": version_year,
                "university_id": univ_id,
                "content": content,
                "context_header": f"[ABES Engineering College: {title}]"
            })

        db.commit()
        print(f"Generating embeddings for {len(kb_chunks)} structured KB records...")
        texts = [c["content"] for c in kb_chunks]
        embs = generate_embeddings(texts)
        vector_store.add_chunks(kb_chunks, embs)
        total_chunks += len(kb_chunks)
        print(f"[OK] Indexed {len(kb_chunks)} records from ABES_Knowledge_Base.json")

    # 2. Ingest ABES_Quick_Reference_Guide.pdf
    quick_ref_path = os.path.join(workspace_dir, "ABES_Quick_Reference_Guide.pdf")
    if os.path.exists(quick_ref_path):
        print("\n[2/3] Processing ABES_Quick_Reference_Guide.pdf...")
        doc = pipeline.process_pdf(
            file_path=quick_ref_path,
            title="ABES Quick Reference Guide",
            category="Academic & Curriculum",
            university_id=univ_id
        )
        print(f"[OK] Ingested ABES_Quick_Reference_Guide.pdf (Chunks: {len(doc.chunks)})")
        total_chunks += len(doc.chunks)

    # 3. Ingest ABES_Student_Handbook.pdf
    handbook_path = os.path.join(workspace_dir, "ABES_Student_Handbook.pdf")
    if os.path.exists(handbook_path):
        print("\n[3/3] Processing ABES_Student_Handbook.pdf (41 pages)...")
        doc = pipeline.process_pdf(
            file_path=handbook_path,
            title="ABES Student Information & Policy Handbook",
            category="Academic & Curriculum",
            university_id=univ_id
        )
        print(f"[OK] Ingested ABES_Student_Handbook.pdf (Chunks: {len(doc.chunks)})")
        total_chunks += len(doc.chunks)

    db.close()
    print("\n" + "=" * 65)
    print(f"  ABES INGESTION COMPLETE! Total Knowledge Chunks: {total_chunks}")
    print("=" * 65)

if __name__ == "__main__":
    run()
