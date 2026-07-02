import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

class UserBase(BaseModel):
    """
    Base Pydantic schema for User containing shared attributes.
    """
    full_name: Optional[str] = Field(None, max_length=255, description="Full name of the user")
    email: str = Field(..., max_length=255, description="Primary email address of the user used for authentication")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number of the user")
    profile_image: Optional[str] = Field(None, max_length=1024, description="URL or path to the user's profile image")
    role: Optional[str] = Field("client", max_length=50, description="Role of the user (e.g., client, provider, admin)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        # Regex format check for email as email-validator is not installed
        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email address format")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        # Phone regex allowing digits, optional leading +, spaces, dashes, parentheses (7 to 25 chars)
        phone_regex = r"^\+?[0-9\s\-()]{7,25}$"
        if not re.match(phone_regex, v):
            raise ValueError("Invalid phone number format")
        return v

class UserCreate(UserBase):
    """
    Pydantic schema for creating a new User.
    """
    pass

class UserUpdate(BaseModel):
    """
    Pydantic schema for updating an existing User. All fields are optional.
    """
    full_name: Optional[str] = Field(None, max_length=255, description="Full name of the user")
    email: Optional[str] = Field(None, max_length=255, description="Primary email address of the user")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number of the user")
    profile_image: Optional[str] = Field(None, max_length=1024, description="URL or path to the user's profile image")
    role: Optional[str] = Field(None, max_length=50, description="Role of the user (e.g., client, provider, admin)")
    is_active: Optional[bool] = Field(None, description="Indicates whether the user account is active")
    is_verified: Optional[bool] = Field(None, description="Indicates whether the user's email/phone has been verified")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().lower()
        email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_regex, v):
            raise ValueError("Invalid email address format")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        phone_regex = r"^\+?[0-9\s\-()]{7,25}$"
        if not re.match(phone_regex, v):
            raise ValueError("Invalid phone number format")
        return v

class UserResponse(UserBase):
    """
    Pydantic schema for returning User information.
    Includes database-generated fields and supports ORM serialization.
    """
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    # Pydantic v2 configuration for ORM serialization
    model_config = ConfigDict(from_attributes=True)
