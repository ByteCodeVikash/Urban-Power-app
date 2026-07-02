from datetime import datetime, timedelta, timezone
from typing import Any
import jwt

from app.core.config import settings

def create_access_token(
    user_id: str,
    phone: str,
    role: str,
    expires_delta: timedelta | None = None
) -> str:
    """
    Generate a signed JWT access token containing standard user claims.
    
    Claims:
      - sub: user_id (string representation of UUID)
      - phone: user contact number
      - role: user authorization role (e.g., client, provider, admin)
      - type: token type identifier ('access')
      - exp: token expiration timestamp
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {
        "sub": user_id,
        "phone": phone,
        "role": role,
        "type": "access",
        "exp": int(expire.timestamp())
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def create_refresh_token(
    user_id: str,
    phone: str,
    role: str,
    expires_delta: timedelta | None = None
) -> str:
    """
    Generate a signed JWT refresh token containing standard user claims.
    
    Claims:
      - sub: user_id (string representation of UUID)
      - phone: user contact number
      - role: user authorization role
      - type: token type identifier ('refresh')
      - exp: token expiration timestamp
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode = {
        "sub": user_id,
        "phone": phone,
        "role": role,
        "type": "refresh",
        "exp": int(expire.timestamp())
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token payload against the config.
    
    Raises:
        jwt.ExpiredSignatureError: If the token has expired.
        jwt.PyJWTError: If the token is invalid/malformed.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
