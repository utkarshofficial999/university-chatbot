import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jaipuria University Knowledge Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # University Multi-Tenant Configuration
    DEFAULT_UNIVERSITY_ID: str = "jaipuria"
    DEFAULT_UNIVERSITY_NAME: str = "Jaipuria Institute of Management / University"
    
    # Security / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jaipuria-super-secret-jwt-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # If DATABASE_URL is set to a postgres url (e.g. postgresql+psycopg://postgres:postgres@localhost:5432/jaipuria_db),
    # pgvector will be used. Otherwise, SQLite + local vector index will be used.
    DATABASE_URL: Optional[str] = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./data/jaipuria_assistant.db"
    )
    
    # LLM Provider: 'gemini', 'ollama', 'openai'
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
    
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
    
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Embeddings Provider: 'fastembed', 'ollama', 'openai', 'gemini'
    EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "fastembed")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
    EMBEDDING_DIMENSION: int = 384  # 384 for bge-small-en-v1.5 / all-MiniLM-L6-v2

    # Vector Database: 'pinecone', 'pgvector', 'local'
    VECTOR_DB_PROVIDER: str = os.getenv("VECTOR_DB_PROVIDER", "pinecone")
    PINECONE_API_KEY: Optional[str] = os.getenv("PINECONE_API_KEY", None)
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "jaipuria-policies")

    
    # Ingestion & Chunking settings
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 120
    
    # RAG Retrieval settings
    TOP_K_VECTOR: int = 8
    TOP_K_BM25: int = 8
    TOP_K_FINAL: int = 5
    
    # Document storage path
    STORAGE_DIR: str = os.path.abspath(os.getenv("STORAGE_DIR", "./data/documents"))
    POLICIES_SOURCE_DIR: str = os.path.abspath(os.getenv("POLICIES_SOURCE_DIR", ".."))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
