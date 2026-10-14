import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # 'student', 'faculty', 'admin'
    university_id = Column(String(50), default="jaipuria", index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    category = Column(String(100), default="General", index=True) # Academic, Hostel, Library, Admission, Placement, Discipline, etc.
    version_year = Column(String(50), default="2025-26") # e.g. 2025-27, 2024-26
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)
    total_chunks = Column(Integer, default=0)
    status = Column(String(50), default="indexed") # 'processing', 'indexed', 'failed'
    university_id = Column(String(50), default="jaipuria", index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    university_id = Column(String(50), default="jaipuria", index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    document = relationship("Document", back_populates="chunks")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), default="New Jaipuria Query")
    university_id = Column(String(50), default="jaipuria", index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(50), nullable=False) # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    citations_json = Column(JSON, default=list) # List of matched citations
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    conversation = relationship("Conversation", back_populates="messages")

class DocumentCategory(Base):
    __tablename__ = "document_categories"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    university_id = Column(String(50), default="jaipuria", index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
