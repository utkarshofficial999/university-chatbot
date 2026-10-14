import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Document, DocumentChunk, DocumentCategory
from backend.app.db.vector_store import vector_store
from backend.app.ingestion.pipeline import IngestionPipeline
from backend.app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    university_id: Optional[str] = "jaipuria"

@router.get("/status")
def get_system_status(
    university_id: Optional[str] = "jaipuria",
    db: Session = Depends(get_db)
):
    total_docs = db.query(Document).filter(Document.university_id == university_id).count()
    total_chunks = db.query(DocumentChunk).filter(DocumentChunk.university_id == university_id).count()
    categories_count = db.query(DocumentCategory).filter(DocumentCategory.university_id == university_id).count()
    
    return {
        "status": "operational",
        "university_id": university_id,
        "total_documents": total_docs,
        "total_chunks": total_chunks,
        "total_categories": categories_count,
        "vector_store_count": vector_store.count(university_id),
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "embedding_model": settings.EMBEDDING_MODEL,
        "database_type": "PostgreSQL (pgvector)" if "postgresql" in (settings.DATABASE_URL or "") else "SQLite (Vector-Enhanced)"
    }

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("General"),
    title: Optional[str] = Form(None),
    university_id: str = Form("jaipuria"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported")

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    target_path = os.path.join(settings.STORAGE_DIR, file.filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pipeline = IngestionPipeline(db)
    try:
        doc = pipeline.process_pdf(
            file_path=target_path,
            title=title,
            category=category,
            university_id=university_id
        )
        return {
            "status": "success",
            "message": f"Successfully processed and indexed '{file.filename}'",
            "document": {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "version_year": doc.version_year,
                "total_pages": doc.total_pages,
                "total_chunks": doc.total_chunks,
                "status": doc.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.delete("/documents/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector store
    vector_store.delete_document(document_id)
    
    # Delete from DB
    db.delete(doc)
    db.commit()

    return {"status": "success", "message": f"Deleted document '{doc.title}'"}

@router.post("/reindex/{document_id}")
def reindex_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document or source file not found")

    pipeline = IngestionPipeline(db)
    try:
        updated_doc = pipeline.process_pdf(
            file_path=doc.file_path,
            title=doc.title,
            category=doc.category,
            university_id=doc.university_id
        )
        return {
            "status": "success",
            "message": f"Successfully re-indexed '{updated_doc.title}'",
            "total_chunks": updated_doc.total_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to re-index document: {str(e)}")

@router.post("/categories")
def add_category(
    data: CategoryCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(DocumentCategory).filter(
        DocumentCategory.name == data.name,
        DocumentCategory.university_id == data.university_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    cat = DocumentCategory(
        name=data.name,
        description=data.description,
        university_id=data.university_id or "jaipuria"
    )
    db.add(cat)
    db.commit()
    return {"status": "success", "id": cat.id, "name": cat.name}

@router.post("/sync-local")
def sync_local_jaipuria_policies(
    db: Session = Depends(get_db)
):
    """
    Scans the workspace directory for the official Jaipuria PDFs and ingests them into the knowledge base.
    """
    # Look in the parent dir or current dir for .pdf files
    search_dirs = [
        settings.POLICIES_SOURCE_DIR,
        os.path.abspath(os.path.join(settings.POLICIES_SOURCE_DIR, "..")),
        os.path.abspath(".")
    ]
    
    found_pdfs = []
    for sdir in search_dirs:
        if os.path.exists(sdir):
            for f in os.listdir(sdir):
                if f.lower().endswith(".pdf") and not f.startswith("."):
                    full_p = os.path.abspath(os.path.join(sdir, f))
                    if full_p not in [p[0] for p in found_pdfs]:
                        found_pdfs.append((full_p, f))

    if not found_pdfs:
        return {"status": "warning", "message": "No PDF files found to ingest", "indexed_count": 0}

    # Intelligent categorization mapping based on policy filename
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

    pipeline = IngestionPipeline(db)
    indexed_docs = []

    for full_path, fname in found_pdfs:
        # Determine category
        cat = "General"
        fname_lower = fname.lower()
        for kw, mapped_cat in category_map.items():
            if kw in fname_lower:
                cat = mapped_cat
                break
        
        # Clean title
        title = fname.replace(".pdf", "").replace("-", " ").replace("_", " ").title()
        
        try:
            doc = pipeline.process_pdf(
                file_path=full_path,
                title=title,
                category=cat,
                university_id="jaipuria"
            )
            indexed_docs.append({
                "filename": fname,
                "title": doc.title,
                "category": doc.category,
                "chunks": doc.total_chunks,
                "pages": doc.total_pages
            })
        except Exception as e:
            print(f"[Sync Local] Error processing {fname}: {e}")

    return {
        "status": "success",
        "message": f"Successfully synchronized and indexed {len(indexed_docs)} Jaipuria policy documents",
        "indexed_count": len(indexed_docs),
        "documents": indexed_docs
    }
