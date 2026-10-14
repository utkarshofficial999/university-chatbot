from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import init_db
from backend.app.api import auth, chat, conversations, documents, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed data on startup
    print(f"[{settings.PROJECT_NAME}] Starting up and initializing database...")
    init_db()
    print(f"[{settings.PROJECT_NAME}] Database ready. Active university tenant: {settings.DEFAULT_UNIVERSITY_ID}")
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
