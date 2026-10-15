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
    settings.DATABASE_URL or "sqlite:///./data/abes_assistant.db",
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
        # 1. Seed Utkarsh as Verified College Admin (24B0101464)
        for admin_email in ["utkarsh@24b0101464@abes.ac.in", "24b0101464@abes.ac.in", "utkarsh.24b0101464@abes.ac.in"]:
            utkarsh_admin = db.query(User).filter(User.email == admin_email).first()
            if not utkarsh_admin:
                utkarsh_admin = User(
                    email=admin_email,
                    hashed_password=hash_password("admin123"),
                    full_name="Utkarsh (College Admin - 24B0101464)",
                    role="admin",
                    university_id=settings.DEFAULT_UNIVERSITY_ID
                )
                db.add(utkarsh_admin)

        # 2. Check if default generic admin exists
        admin = db.query(User).filter(User.email == "admin@abes.ac.in").first()
        if not admin:
            admin = User(
                email="admin@abes.ac.in",
                hashed_password=hash_password("abes2026"),
                full_name="ABES College Administrator",
                role="admin",
                university_id=settings.DEFAULT_UNIVERSITY_ID
            )
            db.add(admin)
        
        # 3. Check student demo user
        student = db.query(User).filter(User.email == "student@abes.ac.in").first()
        if not student:
            student = User(
                email="student@abes.ac.in",
                hashed_password=hash_password("student2026"),
                full_name="ABES Student",
                role="student",
                university_id=settings.DEFAULT_UNIVERSITY_ID
            )
            db.add(student)

        # Seed initial categories for ABES
        initial_categories = [
            ("Academic & Curriculum", "Programmes, syllabus, autonomous/AKTU regulations, and curriculum"),
            ("Admission & Programmes", "B.Tech, M.Tech, MCA eligibility, intake, and admission procedures"),
            ("Hostel & Facilities", "Boys & girls hostels, mess, timings, curfew, campus amenities"),
            ("Examination & Evaluation", "Continuous assessments, end-semester exams, grading, and promotions"),
            ("Fees & Scholarships", "Tuition fees, hostel charges, payment methods, and scholarship schemes"),
            ("Placement & Career", "Placement statistics, recruiting partners, training, and internships"),
            ("Discipline & Anti-Ragging", "Anti-ragging committees, zero tolerance rules, and student conduct"),
            ("Clubs & Student Societies", "Technical clubs, cultural events, sports, and student activities")
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
