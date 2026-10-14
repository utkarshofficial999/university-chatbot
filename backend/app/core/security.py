import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    # PBKDF2 HMAC SHA256 hashing for maximum portability and compatibility
    salt = settings.SECRET_KEY[:16].encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    salt = settings.SECRET_KEY[:16].encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
    return hmac.compare_digest(key.hex(), hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None, role: str = "student", university_id: str = "jaipuria") -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "university_id": university_id
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
