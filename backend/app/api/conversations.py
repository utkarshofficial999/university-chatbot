from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Conversation, Message
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Jaipuria Query"
    university_id: Optional[str] = "jaipuria"

class ConversationRename(BaseModel):
    title: str

@router.get("/")
def list_conversations(
    university_id: Optional[str] = "jaipuria",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Conversation).filter(Conversation.university_id == university_id)
    if current_user:
        query = query.filter(Conversation.user_id == current_user.id)
    
    conversations = query.order_by(Conversation.updated_at.desc()).all()
    results = []
    for c in conversations:
        results.append({
            "id": c.id,
            "title": c.title,
            "university_id": c.university_id,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "message_count": len(c.messages)
        })
    return results

@router.post("/")
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    conv = Conversation(
        user_id=current_user.id if current_user else None,
        title=data.title,
        university_id=data.university_id or "jaipuria"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {
        "id": conv.id,
        "title": conv.title,
        "university_id": conv.university_id,
        "created_at": conv.created_at.isoformat()
    }

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages_data = []
    for m in conv.messages:
        messages_data.append({
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "citations": m.citations_json or [],
            "created_at": m.created_at.isoformat() if m.created_at else None
        })

    return {
        "id": conv.id,
        "title": conv.title,
        "university_id": conv.university_id,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "messages": messages_data
    }

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conv)
    db.commit()
    return {"status": "success", "message": "Conversation deleted"}

@router.put("/{conversation_id}")
def rename_conversation(
    conversation_id: str,
    data: ConversationRename,
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv.title = data.title
    db.commit()
    return {"status": "success", "title": conv.title}
