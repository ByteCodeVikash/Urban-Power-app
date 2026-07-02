import re
from pydantic import BaseModel, Field, field_validator

class SendOTPRequest(BaseModel):
    """
    Pydantic schema for requesting an OTP sent to a phone number.
    """
    phone: str = Field(..., description="Phone number to send OTP to, including country code (e.g. +919876543210)")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be empty")
        
        # Phone regex allowing digits, optional leading +, spaces, dashes, parentheses (7 to 25 chars)
        phone_regex = r"^\+?[0-9\s\-()]{7,25}$"
        if not re.match(phone_regex, v):
            raise ValueError("Invalid phone number format")
        return v


class VerifyOTPRequest(BaseModel):
    """
    Pydantic schema for verifying an OTP sent to a phone number.
    """
    phone: str = Field(..., description="Phone number, including country code (e.g. +919876543210)")
    otp: str = Field(..., description="6-digit verification code")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Phone number cannot be empty")
        
        # Phone regex allowing digits, optional leading +, spaces, dashes, parentheses (7 to 25 chars)
        phone_regex = r"^\+?[0-9\s\-()]{7,25}$"
        if not re.match(phone_regex, v):
            raise ValueError("Invalid phone number format")
        return v

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("OTP cannot be empty")
        # OTP must be a 6-digit numeric string OR a Firebase JWT token (starts with eyJ)
        if not (re.match(r"^\d{6}$", v) or (len(v) > 10 and v.startswith("eyJ"))):
            raise ValueError("OTP must be a 6-digit number or a valid Firebase token")
        return v


class TokenRefreshRequest(BaseModel):
    """
    Pydantic schema for requesting a new access token using a refresh token.
    """
    refresh_token: str


class TokenRefreshResponse(BaseModel):
    """
    Pydantic schema for the refresh token response.
    """
    access_token: str
    token_type: str = "bearer"
    refresh_token: str


class GoogleLoginRequest(BaseModel):
    """
    Pydantic schema for verifying a Google ID token.
    """
    id_token: str = Field(..., description="Google ID Token received from client-side Google Sign-In")


from app.schemas.user import UserResponse

class GoogleLoginResponse(BaseModel):
    """
    Pydantic schema for the Google login response.
    """
    status: str = Field("success", description="Status of the authentication request")
    message: str = Field("Google authentication successful.", description="Human-readable status message")
    is_new_user: bool = Field(..., description="True if a new user account was created, False otherwise")
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type identifier")
    user: UserResponse = Field(..., description="User profile details")



