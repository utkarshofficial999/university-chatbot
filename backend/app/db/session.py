import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings
from backend.app.db.models import Base, User, DocumentCategory
from backend.app.core.security import hash_password

# Ensure directory exists for sqlite database if used
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("sqlite"):
    db_file_path = settings.DATABASE_URL.replace("sqlite:///", "")
    dir_name = os.path.dirname(db_file_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)

# Create engine
connect_args = {"check_same_thread": False} if settings.DATABASE_URL and "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(
    settings.DATABASE_URL or "sqlite:///./data/jaipuria_assistant.db",
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables and seed default admin & categories"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if default admin exists
        admin = db.query(User).filter(User.email == "admin@jaipuria.edu").first()
        if not admin:
            admin = User(
                email="admin@jaipuria.edu",
                hashed_password=hash_password("jaipuria2026"),
                full_name="Jaipuria Policy Administrator",
                role="admin",
                university_id=settings.DEFAULT_UNIVERSITY_ID
            )
            db.add(admin)
        
        # Check student demo user
        student = db.query(User).filter(User.email == "student@jaipuria.edu").first()
        if not student:
            student = User(
                email="student@jaipuria.edu",
                hashed_password=hash_password("student2026"),
                full_name="Jaipuria Scholar",
                role="student",
                university_id=settings.DEFAULT_UNIVERSITY_ID
            )
            db.add(student)

        # Seed initial categories
        initial_categories = [
            ("Academic Regulations", "Course curriculum, grading criteria, academic audit, and regulations"),
            ("Examination & Assessment", "Exam procedures, backlogs, grading scales, and evaluation"),
            ("Hostel Regulations", "Rules of residence, timings, curfew, code of conduct"),
            ("Library Policy", "Borrowing rights, book bank, timings, and literature access"),
            ("Admission Policy", "Eligibility, admission cycles, brochure, and criteria"),
            ("Placement & Internship", "Placement policies, eligibility for recruitment, companies"),
            ("Discipline & Grievance", "Anti-ragging, sexual harassment prevention, grievance redressal"),
            ("Campus & Facilities", "IT policy, vehicle parking, two-wheeler policy, councils")
        ]
        for cat_name, desc in initial_categories:
            exists = db.query(DocumentCategory).filter(DocumentCategory.name == cat_name).first()
            if not exists:
                db.add(DocumentCategory(name=cat_name, description=desc, university_id=settings.DEFAULT_UNIVERSITY_ID))

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[init_db] Warning during DB initialization: {e}")
    finally:
        db.close()
