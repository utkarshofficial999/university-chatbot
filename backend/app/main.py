from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import init_db
from backend.app.api import auth, chat, conversations, documents, admin

def auto_ingest_if_empty():
    import os
    import glob
    from backend.app.db.session import SessionLocal
    from backend.app.db.models import Document
    from backend.app.ingestion.pipeline import IngestionPipeline

    db = SessionLocal()
    try:
        count = db.query(Document).filter(Document.university_id == settings.DEFAULT_UNIVERSITY_ID).count()
        if count == 0:
            print("[Auto-Ingestion] Knowledge base has 0 documents. Scanning for policy PDFs...")
            search_dirs = [os.getcwd(), os.path.dirname(os.getcwd()), "/app", os.path.join("/app", "backend")]
            pdf_files = []
            for d in search_dirs:
                if os.path.isdir(d):
                    found = glob.glob(os.path.join(d, "*.pdf"))
                    if found:
                        pdf_files = found
                        break
            if pdf_files:
                print(f"[Auto-Ingestion] Found {len(pdf_files)} PDFs. Ingesting into knowledge base...")
                pipeline = IngestionPipeline(db)
                for fpath in pdf_files:
                    fname = os.path.basename(fpath)
                    title = os.path.splitext(fname)[0].replace("-", " ").title()
                    cat = "General"
                    fn_lower = fname.lower()
                    if "academic" in fn_lower or "calendar" in fn_lower or "audit" in fn_lower:
                        cat = "Academic Regulations"
                    elif "exam" in fn_lower or "assessment" in fn_lower:
                        cat = "Examination & Assessment"
                    elif "hostel" in fn_lower:
                        cat = "Hostel Regulations"
                    elif "library" in fn_lower:
                        cat = "Library Policy"
                    elif "admission" in fn_lower or "brochure" in fn_lower:
                        cat = "Admission Policy"
                    elif "placement" in fn_lower:
                        cat = "Placement & Internship"
                    elif "ragging" in fn_lower or "grievance" in fn_lower or "harassment" in fn_lower:
                        cat = "Discipline & Grievance"
                    elif "it" in fn_lower or "wheel" in fn_lower or "council" in fn_lower:
                        cat = "Campus & Facilities"

                    try:
                        pipeline.ingest_file(
                            file_path=fpath,
                            document_title=title,
                            category=cat,
                            university_id=settings.DEFAULT_UNIVERSITY_ID,
                            version_year="2025-26"
                        )
                    except Exception as e:
                        print(f"[Auto-Ingestion] Error ingesting {fname}: {e}")
                print("[Auto-Ingestion] Knowledge base ingestion complete.")
    except Exception as e:
        print(f"[Auto-Ingestion] Auto-ingest check error: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed data on startup
    print(f"[{settings.PROJECT_NAME}] Starting up and initializing database...")
    init_db()
    print(f"[{settings.PROJECT_NAME}] Database ready. Active university tenant: {settings.DEFAULT_UNIVERSITY_ID}")
    try:
        auto_ingest_if_empty()
    except Exception as e:
        print(f"[Lifespan] Auto-ingest skipped: {e}")
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Official Jaipuria University Knowledge Assistant API with RAG, pgvector support, and multi-tenant foundation.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "university": settings.DEFAULT_UNIVERSITY_NAME,
        "docs_url": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "university_id": settings.DEFAULT_UNIVERSITY_ID,
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
