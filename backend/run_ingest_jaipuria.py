"""
Standalone ingestion script for Jaipuria University Policies.
Scans the current workspace directory for all PDF documents and indexes them.
"""

import sys
import os

# Add parent directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app.db.session import SessionLocal, init_db
from backend.app.ingestion.pipeline import IngestionPipeline

def run():
    print("=" * 60)
    print("JAIPURIA UNIVERSITY KNOWLEDGE INGESTION PIPELINE")
    print("=" * 60)
    
    init_db()
    db = SessionLocal()
    pipeline = IngestionPipeline(db)

    # Path where policy PDFs reside
    workspace_dir = parent_dir
    print(f"Scanning directory: {workspace_dir}")

    category_map = {
        "academic": "Academic Regulations",
        "examination": "Examination & Assessment",
        "assessment": "Examination & Assessment",
        "calendar": "Academic Regulations",
        "audit": "Academic Regulations",
        "hostel": "Hostel Regulations",
        "library": "Library Policy",
        "admission": "Admission Policy",
        "brochure": "Admission Policy",
        "placement": "Placement & Internship",
        "anti-ragging": "Discipline & Grievance",
        "sexual-harassment": "Discipline & Grievance",
        "grievance": "Discipline & Grievance",
        "it-policy": "Campus & Facilities",
        "two-wheeler": "Campus & Facilities",
        "council": "Campus & Facilities"
    }

    pdf_files = [f for f in os.listdir(workspace_dir) if f.lower().endswith(".pdf")]
    print(f"Found {len(pdf_files)} PDF policies to process.\n")

    indexed_count = 0
    for idx, fname in enumerate(pdf_files, 1):
        full_path = os.path.join(workspace_dir, fname)
        
        # Categorize
        cat = "General"
        fname_lower = fname.lower()
        for kw, mapped_cat in category_map.items():
            if kw in fname_lower:
                cat = mapped_cat
                break

        title = fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
        print(f"[{idx}/{len(pdf_files)}] Processing: {fname}")
        print(f"       Category: {cat}")

        try:
            doc = pipeline.process_pdf(
                file_path=full_path,
                title=title,
                category=cat,
                university_id="jaipuria"
            )
            print(f"       -> Indexed {doc.total_pages} pages, {doc.total_chunks} chunks (Version: {doc.version_year})")
            indexed_count += 1
        except Exception as e:
            print(f"       -> ERROR: {e}")

    print("\n" + "=" * 60)
    print(f"Ingestion Completed! {indexed_count}/{len(pdf_files)} documents successfully indexed.")
    print("=" * 60)
    db.close()

if __name__ == "__main__":
    run()
