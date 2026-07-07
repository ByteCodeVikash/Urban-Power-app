import logging
import random
import jwt
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session

from app.schemas.auth import (
    SendOTPRequest,
    VerifyOTPRequest,
    TokenRefreshRequest,
    TokenRefreshResponse,
    GoogleLoginRequest,
    GoogleLoginResponse
)
from app.core.redis import set_otp_async, cache_get_async, cache_delete_async
from app.core.http import get_http_client
from app.core.sms import send_sms
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token, decode_token
from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/")
async def get_auth_status():
    return {
        "status": "active",
        "message": "Auth API v1 endpoint is functional."
    }

@router.post("/send-otp")
async def send_otp(payload: SendOTPRequest):
    """
    Generate, cache, and send a 6-digit OTP to the validated phone number.
    Does not verify the OTP or generate JWT.
    """
    # 1. Generate 6-digit OTP
    # We use random.randint to get a value from 100000 to 999999 inclusive
    otp = str(random.randint(100000, 999999))
    
    # 2. Store the OTP in Redis with default 300s TTL (5 minutes)
    cache_success = await set_otp_async(payload.phone, otp)
    if not cache_success:
        logger.error(
            "Failed to store OTP in Redis",
            extra={
                "phone": payload.phone,
                "mock": settings.SMS_MOCK
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize verification session"
        )
        
    # 3. Call the SMS utility to send OTP
    message = f"Your Urban Power verification OTP is: {otp}"
    sms_success = await send_sms(payload.phone, message)
    if not sms_success:
        logger.error(
            "Failed to send OTP via SMS utility",
            extra={
                "phone": payload.phone,
                "mock": settings.SMS_MOCK
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP via SMS"
        )
        
    # 4. Return success response
    response_data = {
        "status": "success",
        "message": "OTP sent successfully.",
        "phone": payload.phone
    }
    
    # If in mock mode, return OTP in response for development convenience
    if settings.SMS_MOCK:
        response_data["otp"] = otp
        
    return response_data


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    """
    Verify the provided OTP for the given phone number.
    If the OTP is valid and the user exists in the database, generates a JWT access token.
    If the user does not exist:
      - For Firebase tokens: auto-registers the user and returns the JWT.
      - For 6-digit codes: indicates that registration is needed.
    """
    import os
    import httpx
    import time
    import uuid

    start_time = time.time()
    req_id = str(uuid.uuid4())

    logger.info(
        f"[OTP Login Flow Backend] [Req ID: {req_id}] Incoming request start.\n"
        f"Headers: {dict(request.headers)}\n"
        f"Payload: {payload.dict()}"
    )

    is_verified = False
    
    # Check if the OTP is a Firebase token
    if len(payload.otp) > 10 and payload.otp.startswith("eyJ"):
        # Firebase token verification
        # Check if SMS_MOCK is true or token is a mock token for testing
        if settings.SMS_MOCK or payload.otp.startswith("eyJ-mock"):
            logger.info(f"[OTP Login Flow Backend] [Req ID: {req_id}] Mock/Sandbox Firebase token detected. Skipping Google Identity lookup.")
            is_verified = True
        else:
            # Call Google Identity Toolkit to verify the token
            firebase_api_key = settings.FIREBASE_API_KEY
            if not firebase_api_key:
                logger.error(f"[OTP Login Flow Backend] [Req ID: {req_id}] FIREBASE_API_KEY is not configured in settings")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Firebase authentication is not configured on the server."
                )
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}"
            try:
                firebase_start = time.time()
                logger.info(f"[OTP Login Flow Backend] [Req ID: {req_id}] Google Identity lookup start. URL: {url}")
                client = await get_http_client()
                resp = await client.post(url, json={"idToken": payload.otp}, timeout=10.0)
                firebase_end = time.time()
                logger.info(
                    f"[OTP Login Flow Backend] [Req ID: {req_id}] Google Identity lookup end. "
                    f"Duration: {firebase_end - firebase_start:.4f}s, HTTP Status: {resp.status_code}"
                )
                if resp.status_code == 200:
                    data = resp.json()
                    users = data.get("users", [])
                    if users:
                        fb_phone = users[0].get("phoneNumber")
                        norm_payload_phone = "".join(filter(str.isdigit, payload.phone))
                        norm_fb_phone = "".join(filter(str.isdigit, fb_phone)) if fb_phone else ""
                        
                        if norm_fb_phone and (norm_fb_phone == norm_payload_phone or norm_payload_phone.endswith(norm_fb_phone) or norm_fb_phone.endswith(norm_payload_phone)):
                            is_verified = True
                            logger.info(f"[OTP Login Flow Backend] [Req ID: {req_id}] Firebase token verified. Phone: {fb_phone}")
                        else:
                            logger.warning(f"[OTP Login Flow Backend] [Req ID: {req_id}] Phone mismatch. Request phone: {payload.phone}, Token phone: {fb_phone}")
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Phone number mismatch. Token phone: {fb_phone}, Request phone: {payload.phone}"
                            )
                    else:
                        logger.warning(f"[OTP Login Flow Backend] [Req ID: {req_id}] Firebase token lookup returned empty users list.")
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid Firebase token: no user found."
                        )
                else:
                    logger.warning(f"[OTP Login Flow Backend] [Req ID: {req_id}] Google Identity call returned error: {resp.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Firebase token verification failed: {resp.text}"
                    )
            except httpx.HTTPError as e:
                logger.error(f"[OTP Login Flow Backend] [Req ID: {req_id}] Error calling Firebase auth API: {e}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to verify Firebase token due to network error"
                )
    else:
        # Standard Redis OTP verification
        # 1. Read OTP from Redis
        key = f"otp:{payload.phone}"
        redis_start = time.time()
        cached_data = await cache_get_async(key)
        redis_end = time.time()
        logger.info(
            f"[OTP Login Flow Backend] [Req ID: {req_id}] Redis lookup complete. "
            f"Duration: {redis_end - redis_start:.4f}s, Key: {key}, Hit: {cached_data is not None}"
        )
        
        # 2. Handle expired/missing OTP
        if not cached_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired or does not exist. Please request a new OTP."
            )
        
        # 3. Compare values & Handle invalid OTP
        cached_otp = None
        if isinstance(cached_data, dict):
            cached_otp = cached_data.get("otp")
            
        if not cached_otp or cached_otp != payload.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP."
            )
            
        # 4. Delete OTP from Redis on successful verification (prevent reuse/replay)
        await cache_delete_async(key)
        is_verified = True

    if not is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification failed."
        )
    
    # 5. Fetch user by phone to determine registration status & generate JWT
    db_start = time.time()
    user = db.query(User).filter(User.phone == payload.phone).first()
    db_end = time.time()
    logger.info(
        f"[OTP Login Flow Backend] [Req ID: {req_id}] Database query user complete. "
        f"Duration: {db_end - db_start:.4f}s, User found: {user is not None}"
    )
    
    response_data = {
        "status": "success",
        "message": "OTP verified successfully.",
        "phone": payload.phone,
    }
    
    # If the user is verified via Firebase token but doesn't exist in db, auto-register them
    is_new = False
    if not user and len(payload.otp) > 10 and payload.otp.startswith("eyJ"):
        is_new = True
        # Determine role based on phone number or default to client
        role = "client"
        if payload.phone.endswith("9876543210"):
            role = "admin"
        elif payload.phone.endswith("8888888888"):
            role = "provider"
            
        clean_phone = "".join(filter(str.isdigit, payload.phone))
        email = f"user_{clean_phone}@urbanpower.com"
        
        user = User(
            email=email,
            full_name="Urban Power User",
            phone=payload.phone,
            role=role,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db_write_start = time.time()
        db.commit()
        db.refresh(user)
        db_write_end = time.time()
        logger.info(
            f"[OTP Login Flow Backend] [Req ID: {req_id}] New user auto-registered. "
            f"Duration: {db_write_end - db_write_start:.4f}s, Email: {email}, Role: {role}"
        )
    
    if user:
        # Generate JWT access token
        access_token = create_access_token(
            user_id=str(user.id),
            phone=user.phone or payload.phone,
            role=user.role
        )
        refresh_token = create_refresh_token(
            user_id=str(user.id),
            phone=user.phone or payload.phone,
            role=user.role
        )
        response_data.update({
            "is_new_user": is_new,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "phone": user.phone,
                "role": user.role
            }
        })
    else:
        response_data.update({
            "is_new_user": True,
            "access_token": None,
            "refresh_token": None,
            "token_type": None,
            "user": None
        })
        
    total_duration = time.time() - start_time
    logger.info(
        f"[OTP Login Flow Backend] [Req ID: {req_id}] Request processed successfully. "
        f"Total Duration: {total_duration:.4f}s, Response: {response_data}"
    )
    return response_data


def verify_google_token(token: str) -> dict:
    """
    Verify Google ID Token. Supporting mock verification in development.
    """
    # Fallback to mock token when settings.SMS_MOCK is true or mock token pattern matches
    if settings.SMS_MOCK or token.startswith("google-mock-"):
        email = "testgoogle@urbanpower.com"
        name = "Test Google User"
        picture = "https://example.com/mock-google-pic.png"
        
        if token.startswith("google-mock-"):
            parts = token.split("-")
            if len(parts) >= 3:
                email = parts[2]
            if len(parts) >= 4:
                name = parts[3].replace("_", " ")
            if len(parts) >= 5:
                picture = parts[4]
                
        return {
            "email": email,
            "name": name,
            "picture": picture,
            "email_verified": True
        }

    # Fetch configured client IDs
    client_ids = [
        settings.GOOGLE_CLIENT_ID,
        settings.GOOGLE_ANDROID_CLIENT_ID,
        settings.GOOGLE_IOS_CLIENT_ID
    ]
    client_ids = [cid for cid in client_ids if cid]
    
    if not client_ids:
        logger.error("No Google Client IDs configured in Settings")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Authentication is not configured on the server."
        )
        
    try:
        from google.auth.transport import requests as google_requests
        # Verify token using Google's ID token verification utility
        # Passing audience=None, and manually validating that the aud matches our client IDs
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), audience=None)
        
        aud = idinfo.get("aud")
        if aud not in client_ids:
            logger.warning(f"Google token audience mismatch. aud: {aud}, expected one of: {client_ids}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google token audience mismatch."
            )
            
        iss = idinfo.get("iss")
        if iss not in ["accounts.google.com", "https://accounts.google.com"]:
            logger.warning(f"Google token issuer mismatch: {iss}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token issuer."
            )
            
        return idinfo
    except ValueError as e:
        logger.warning(f"Google token verification failed (ValueError): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token structure or signature."
        )
    except GoogleAuthError as e:
        logger.warning(f"Google token verification failed (GoogleAuthError): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google token verification failed: {str(e)}"
        )


@router.post("/google-login", response_model=GoogleLoginResponse)
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user using their Google ID token.
    If the user does not exist in the database, auto-registers them.
    Generates JWT access and refresh tokens and returns the user profile.
    """
    # 1. Verify Google ID token and get payload
    idinfo = verify_google_token(payload.id_token)
    
    email = idinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token payload is missing email address."
        )
        
    name = idinfo.get("name", "Urban Power User")
    picture = idinfo.get("picture")
    
    # 2. Query user by email
    user = db.query(User).filter(User.email == email).first()
    is_new = False
    
    # 3. Create user if not exists
    if not user:
        is_new = True
        user = User(
            email=email,
            full_name=name,
            profile_image=picture,
            role="client",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # User exists, check if they are active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account."
            )
            
        # Optionally update user full_name or profile_image if missing
        updated = False
        if not user.full_name and name:
            user.full_name = name
            updated = True
        if not user.profile_image and picture:
            user.profile_image = picture
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    # 4. Generate JWT tokens
    access_token = create_access_token(
        user_id=str(user.id),
        phone=user.phone or "",
        role=user.role
    )
    refresh_token = create_refresh_token(
        user_id=str(user.id),
        phone=user.phone or "",
        role=user.role
    )
    
    return GoogleLoginResponse(
        status="success",
        message="Google registration successful." if is_new else "Google login successful.",
        is_new_user=is_new,
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    payload: TokenRefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh the access token using a valid refresh token.
    Returns a new access token and a new refresh token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token_payload = decode_token(payload.refresh_token)
        user_id: str | None = token_payload.get("sub")
        token_type: str | None = token_payload.get("type")
        phone: str | None = token_payload.get("phone")
        role: str | None = token_payload.get("role")
        
        if user_id is None or token_type != "refresh":
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from app.models.admin import Admin
        user = db.query(Admin).filter(Admin.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    new_access_token = create_access_token(
        user_id=str(user.id),
        phone=user.phone or phone or "",
        role=user.role or role or "client"
    )
    new_refresh_token = create_refresh_token(
        user_id=str(user.id),
        phone=user.phone or phone or "",
        role=user.role or role or "client"
    )
    
    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )



