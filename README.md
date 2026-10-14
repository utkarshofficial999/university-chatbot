# 🏛️ Jaipuria University AI Knowledge Assistant (V1)

An enterprise-grade, privacy-first Retrieval-Augmented Generation (RAG) assistant specifically built for **Jaipuria University** regulations, academic policies, hostel rules, and student handbooks.

Built with a clean multi-tenant architecture ready to scale from **Jaipuria (V1)** to a multi-university platform in future versions.

---

## 🏗️ Architecture Overview

```text
React 19 + TypeScript (Vite)
        ↓  (SSE Streaming & REST)
     FastAPI Backend
        ↓
  Jaipuria RAG Engine
  [Hybrid BM25 + Vector Search (RRF) + Recency Reranking]
        ↓
PostgreSQL + pgvector (with Local Vector-Store auto-fallback)
        ↓
Official Jaipuria Policy Documents (PDFs)
        ↓
LLM Generation (Ollama llama3.2 / Gemini / OpenAI)
        ↓
Accurate Answers + Interactive Page-Level Citations
```

---

## 🚀 6 Core Modules Implemented

### 1. 💬 Chat UI — React + TypeScript
- **Jaipuria Brand Aesthetics**: Deep obsidian (`#070d19`), regal gold (`#e5a958`), clean cards, and Outfit/Inter typography.
- **Server-Sent Events (SSE) Streaming**: Real-time token streaming with active status indicators.
- **Interactive Citations Drawer/Modal**: Every answer references official source documents with page numbers, recency year, and match confidence.
- **Conversation History**: Full session management with search, deletion, and category scoping.

### 2. ⚡ FastAPI Backend
- `/api/v1/chat/stream` & `/api/v1/chat/query`: Streaming and sync RAG endpoints.
- `/api/v1/documents`: Document catalog, category filters, and direct PDF streaming.
- `/api/v1/conversations`: Chat sessions and history tracking.
- `/api/v1/auth`: JWT-based authentication supporting Student, Faculty, and Admin roles.
- `/api/v1/admin`: Document ingestion, re-indexing, deletion, and local policy synchronization.

### 3. 📄 Document Ingestion Pipeline
- Page-by-page PDF extraction with page-index tracking (`pypdf`).
- Context-aware recursive chunking with document headers, academic year detection, and token overlap.
- High-performance dense embeddings via ONNX Runtime (`BAAI/bge-small-en-v1.5`, 384 dimensions).
- Dual storage in relational database + vector index.

### 4. 🧠 Jaipuria RAG Engine
- **Hybrid Search**: Combines Dense Vector Cosine Similarity with Sparse BM25 Keyword Search.
- **Reciprocal Rank Fusion (RRF)**: Merges rankings (`1 / (60 + rank)`).
- **Recency Booster**: Gives calibrated priority to newer academic years (e.g. `2025-27` over `2024-26`).
- **Reranker**: Calculates calibrated confidence scores and query overlap.

### 5. 🛡️ Admin & Ingestion Dashboard
- Real-time knowledge base statistics (Documents, Chunks, Vector Dimension, LLM Provider).
- Single-click **"Sync All Jaipuria Folder Policies"** scanning all existing PDFs in the workspace.
- Drag-and-drop PDF uploader with category tagging.
- Per-document Re-index, Delete, and View PDF actions.

### 6. 🔒 AI Safety & Hallucination Guardrails
- Strictly governed by the official Jaipuria system prompt.
- Factual verification: Rejects queries when confidence is low with the official university fallback:
  > *"I couldn't find an official Jaipuria University document confirming this information. Please verify it with the relevant university department or official university source."*
- Never invents policies or answers from non-Jaipuria materials.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/             # API Routers (auth, chat, conversations, documents, admin)
│   │   ├── core/            # Config, Security (JWT/PBKDF2), System Prompts
│   │   ├── db/              # SQLAlchemy Models, Session, Vector Store
│   │   ├── ingestion/       # PDF Extractor, Chunker, Ingestion Pipeline
│   │   ├── rag/             # Hybrid Search, Reranker, LLM Client, RAG Engine
│   │   └── main.py          # FastAPI application entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── run_ingest_jaipuria.py  # Standalone local policy ingestion runner
│   └── scripts/
│       └── init_pgvector.sql   # SQL schema for PostgreSQL pgvector
├── frontend/
│   ├── src/
│   │   ├── components/      # ChatInterface, MessageItem, CitationModal, Header, AdminDashboard
│   │   ├── context/         # AuthContext
│   │   ├── api/             # API client with SSE streaming
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css        # Jaipuria design system styling
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # Production pgvector PostgreSQL container
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (Python 3.14 supported)
- Node.js 18+ (Node 24 supported)
- Optional: Ollama (for local LLM inference) or Gemini/OpenAI API key
- Optional: Docker (for pgvector PostgreSQL container)

### 2. Backend Setup
```powershell
# Navigate to project root
cd "e:\jaipuria college policies"

# Activate virtual environment
.\backend_venv\Scripts\activate

# Install dependencies (if setting up fresh)
pip install -r backend/requirements.txt

# Run the ingestion script to index all Jaipuria policies
python backend/run_ingest_jaipuria.py

# Start the FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: **`http://127.0.0.1:8000/docs`**

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser.

### 4. Running with PostgreSQL + pgvector (Optional)
To use a production PostgreSQL container with `pgvector`:
```powershell
docker compose up -d
```
Then update `backend/.env`:
```env
DATABASE_URL=postgresql+psycopg://jaipuria_user:jaipuria_password_2026@localhost:5432/jaipuria_rag_db
```

---

## 🔄 Multi-University Roadmap (V2)

The architecture is multi-tenant by design:
1. Every Document, Chunk, and Conversation is indexed with `university_id: str` (defaulting to `"jaipuria"`).
2. The RAG vector retrieval filters isolate chunks by `university_id`.
3. Adding a new university in V2 simply requires:
   - Creating a tenant row (e.g. `university_id: "abes"`, `"amity"`, etc.).
   - Uploading that university's policy set under its respective tenant ID.
   - Core ingestion, hybrid search, and citation mechanisms remain identical.
>>>>>>> 30e5210 (feat: complete Jaipuria University AI Knowledge Assistant V1 with full RAG engine, React frontend, FastAPI backend, and multi-tenant foundation)
