import os
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Document, DocumentCategory
from backend.app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/")
def list_documents(
    university_id: Optional[str] = "jaipuria",
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.university_id == university_id)
    if category and category != "All":
        query = query.filter(Document.category == category)
    if search:
        query = query.filter(Document.title.ilike(f"%{search}%"))
    
    docs = query.order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "title": d.title,
            "filename": d.filename,
            "category": d.category,
            "version_year": d.version_year,
            "file_size": d.file_size,
            "total_pages": d.total_pages,
            "total_chunks": d.total_chunks,
            "status": d.status,
            "university_id": d.university_id,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "updated_at": d.updated_at.isoformat() if d.updated_at else None
        })
    return results

@router.get("/categories")
def get_categories(
    university_id: Optional[str] = "jaipuria",
    db: Session = Depends(get_db)
):
    cats = db.query(DocumentCategory).filter(
        DocumentCategory.university_id == university_id
    ).all()
    return [{"id": c.id, "name": c.name, "description": c.description} for c in cats]

@router.get("/{document_id}")
def get_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": doc.id,
        "title": doc.title,
        "filename": doc.filename,
        "category": doc.category,
        "version_year": doc.version_year,
        "file_size": doc.file_size,
        "total_pages": doc.total_pages,
        "total_chunks": doc.total_chunks,
        "status": doc.status,
        "created_at": doc.created_at.isoformat() if doc.created_at else None
    }

@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on server")
    
    return FileResponse(
        path=doc.file_path,
        filename=doc.filename,
        media_type="application/pdf"
    )
