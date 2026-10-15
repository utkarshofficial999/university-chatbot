-- Initialize pgvector extension for ABES Engineering College RAG Engine
CREATE EXTENSION IF NOT EXISTS vector;

-- Initial table for multi-tenant pgvector chunks
CREATE TABLE IF NOT EXISTS university_chunks (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    university_id VARCHAR(50) DEFAULT 'abes',
    chunk_index INT NOT NULL,
    page_number INT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    version_year VARCHAR(50) DEFAULT '2025-26',
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_university ON university_chunks(university_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON university_chunks(document_id);
-- HNSW cosine index for sub-millisecond vector similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw ON university_chunks USING hnsw (embedding vector_cosine_ops);
