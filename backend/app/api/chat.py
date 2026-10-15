import json
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Conversation, Message
from backend.app.rag.engine import rag_engine
from backend.app.core.config import settings
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat & RAG"])

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    session_id: Optional[str] = None
    category: Optional[str] = None
    university_id: Optional[str] = "abes"

class ChatResponse(BaseModel):
    answer: str
    citations: List[Dict[str, Any]]
    conversation_id: str

@router.post("/query", response_model=ChatResponse)
async def query_chat(
    req: ChatRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    univ_id = req.university_id or settings.DEFAULT_UNIVERSITY_ID
    sid = req.session_id or x_session_id
    
    # Manage conversation with session isolation
    conv = None
    if req.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
        if conv:
            # Prevent tampering with other users' conversations
            if conv.user_id and (not current_user or current_user.id != conv.user_id):
                conv = None
            elif conv.session_id and (not sid or conv.session_id != sid):
                conv = None
    
    if not conv:
        user_id = current_user.id if current_user else None
        title = req.query[:40] + ("..." if len(req.query) > 40 else "")
        conv = Conversation(
            user_id=user_id,
            session_id=sid,
            title=title,
            university_id=univ_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        content=req.query,
        citations_json=[]
    )
    db.add(user_msg)
    db.commit()

    # RAG Retrieval & LLM Generation
    result = await rag_engine.query_sync(
        query=req.query,
        university_id=univ_id,
        category=req.category
    )

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        sender="assistant",
        content=result["answer"],
        citations_json=result["citations"]
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "answer": result["answer"],
        "citations": result["citations"],
        "conversation_id": conv.id
    }

@router.post("/stream")
async def stream_chat(
    req: ChatRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    univ_id = req.university_id or settings.DEFAULT_UNIVERSITY_ID
    sid = req.session_id or x_session_id

    # Manage conversation with session isolation
    conv = None
    if req.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
        if conv:
            # Prevent tampering with other users' conversations
            if conv.user_id and (not current_user or current_user.id != conv.user_id):
                conv = None
            elif conv.session_id and (not sid or conv.session_id != sid):
                conv = None
    
    if not conv:
        user_id = current_user.id if current_user else None
        title = req.query[:40] + ("..." if len(req.query) > 40 else "")
        conv = Conversation(
            user_id=user_id,
            session_id=sid,
            title=title,
            university_id=univ_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        content=req.query,
        citations_json=[]
    )
    db.add(user_msg)
    db.commit()

    conv_id = conv.id

    async def event_generator():
        collected_tokens = []
        collected_citations = []

        async for event in rag_engine.query_stream(
            query=req.query,
            university_id=univ_id,
            category=req.category
        ):
            event_type = event["type"]
            if event_type == "citations":
                collected_citations = event["data"]
                yield f"data: {json.dumps({'type': 'citations', 'data': collected_citations, 'conversation_id': conv_id})}\n\n"
            elif event_type == "token":
                collected_tokens.append(event["data"])
                yield f"data: {json.dumps({'type': 'token', 'data': event['data']})}\n\n"
            elif event_type == "done":
                # Persist completed response to DB
                full_answer = "".join(collected_tokens)
                assistant_msg = Message(
                    conversation_id=conv_id,
                    sender="assistant",
                    content=full_answer,
                    citations_json=collected_citations
                )
                db.add(assistant_msg)
                db.commit()
                yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
