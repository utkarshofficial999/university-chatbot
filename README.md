# 🏛️ ABES Engineering College AI Knowledge Assistant

An enterprise-grade, privacy-first Retrieval-Augmented Generation (RAG) assistant specifically built for **ABES Engineering College, Ghaziabad (AKTU Code 032)** regulations, academic policies, student handbook, and institutional guides.

Built with a clean multi-tenant architecture with Pinecone vector database integration, non-blocking Gemini AI streaming, and interactive source citations.

---

## 🏗️ Architecture Overview

```text
React 19 + TypeScript (Vite)
        ↓  (SSE Streaming & REST)
     FastAPI Backend
        ↓
  ABES RAG Engine
  [Hybrid BM25 + Vector Search (RRF) + Recency Reranking]
        ↓
Pinecone Serverless Vector Database (BAAI/bge-small-en-v1.5)
        ↓
Official ABES Policy Documents (Student Handbook, Quick Reference Guide, Verified JSON KB)
        ↓
LLM Generation (Gemini 2.5 Flash / Flash Lite streaming)
        ↓
Accurate Answers + Interactive Page-Level Citations
```

---

## 🚀 6 Core Modules Implemented

### 1. 💬 Chat UI — React + TypeScript
- **ABES Brand Aesthetics**: Deep obsidian (`#070d19`), regal crimson & amber accents, clean cards, and Outfit/Inter typography.
- **Server-Sent Events (SSE) Streaming**: Real-time token streaming with active status indicators.
- **Interactive Citations Drawer/Modal**: Every answer references official source documents with page numbers, recency year, and match confidence.
- **Conversation History**: Full session management with search, deletion, and category scoping.

### 2. ⚡ FastAPI Backend
- `/api/v1/chat/stream` & `/api/v1/chat/query`: Streaming and sync RAG endpoints.
- `/api/v1/documents`: Document catalog, category filters, and direct PDF streaming.
- `/api/v1/conversations`: Chat sessions and history tracking.
- `/api/v1/auth`: JWT-based authentication supporting Student (`student@abes.ac.in`), Faculty, and Admin (`admin@abes.ac.in`) roles.
- `/api/v1/admin`: Document ingestion, re-indexing, deletion, and local policy synchronization.

### 3. 📄 Document Ingestion Pipeline
- Page-by-page PDF extraction with page-index tracking (`pypdf`).
- Context-aware recursive chunking with document headers, academic year detection, and token overlap.
- High-performance dense embeddings via ONNX Runtime (`BAAI/bge-small-en-v1.5`, 384 dimensions).
- Ingestion of structured official JSON records (`ABES_Knowledge_Base.json`) and PDFs (`ABES_Student_Handbook.pdf`, `ABES_Quick_Reference_Guide.pdf`).

### 4. 🧠 ABES RAG Engine
- **Hybrid Search**: Combines Dense Vector Cosine Similarity with Sparse BM25 Keyword Search.
- **Reciprocal Rank Fusion (RRF)**: Merges rankings (`1 / (60 + rank)`).
- **Recency Booster**: Gives calibrated priority to newer academic policies.
- **Reranker**: Calculates calibrated confidence scores and query overlap.

### 5. 🛡️ Admin & Ingestion Dashboard
- Real-time knowledge base statistics (Documents, Chunks, Vector Dimension, LLM Provider).
- Single-click **"Sync All ABES College Policies"** scanning all existing PDFs and JSON data in the workspace.
- Drag-and-drop PDF uploader with category tagging.
- Per-document Re-index, Delete, and View PDF actions.

### 6. 🔒 AI Safety & Hallucination Guardrails
- Strictly governed by the official ABES Engineering College system prompt.
- Factual verification: Rejects queries when confidence is low with the official college fallback:
  > *"I couldn't find an official ABES Engineering College document confirming this information. Please verify it with the relevant college department or official source."*
- Never invents policies or answers from non-ABES materials.

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
│   ├── run_ingest_abes.py   # Standalone ABES policy ingestion runner
│   └── scripts/
│       └── init_pgvector.sql   # SQL schema for PostgreSQL pgvector
├── frontend/
│   ├── src/
│   │   ├── components/      # ChatInterface, MessageItem, CitationModal, Header, AdminDashboard
│   │   ├── context/         # AuthContext
│   │   ├── api/             # API client with SSE streaming
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css        # ABES design system styling
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # Production container configuration
├── ABES_Student_Handbook.pdf
├── ABES_Quick_Reference_Guide.pdf
├── ABES_Knowledge_Base.json
├── ABES_Source_Register_and_Coverage_Audit.xlsx
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (Python 3.11/3.14 supported)
- Node.js 18+ (Node 20+ supported)
- Gemini API key (`GEMINI_API_KEY`)
- Pinecone API key (`PINECONE_API_KEY`)

### 2. Backend Setup
```powershell
# Navigate to project root
cd "e:\jaipuria college policies"

# Activate virtual environment
.\backend_venv\Scripts\activate

# Install dependencies (if setting up fresh)
pip install -r backend/requirements.txt

# Run the ingestion script to index all ABES policies
python backend/run_ingest_abes.py

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
