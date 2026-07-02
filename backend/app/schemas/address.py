import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

class AddressBase(BaseModel):
    """
    Base Pydantic schema for Address containing shared attributes.
    """
    address_type: Optional[str] = Field("Home", max_length=50, description="Type of address (e.g. Home, Work, Other)")
    house_number: Optional[str] = Field(None, max_length=255, description="House/flat/building number")
    landmark: Optional[str] = Field(None, max_length=255, description="Nearby landmark")
    street: str = Field(..., max_length=255, description="Street name or locality")
    city: str = Field(..., max_length=100, description="City name")
    state: str = Field(..., max_length=100, description="State name")
    pincode: str = Field(..., max_length=20, description="Postal PIN code")
    latitude: Optional[float] = Field(None, description="Geographic latitude coordinate")
    longitude: Optional[float] = Field(None, description="Geographic longitude coordinate")
    is_default: Optional[bool] = Field(False, description="Whether this is the default address")

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[a-zA-Z0-9\s\-]{3,10}$", v):
            raise ValueError("Invalid pincode format")
        return v

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if not -90.0 <= v <= 90.0:
                raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if not -180.0 <= v <= 180.0:
                raise ValueError("Longitude must be between -180 and 180")
        return v

class AddressCreate(AddressBase):
    """
    Pydantic schema for creating a new Address.
    """
    pass

class AddressUpdate(BaseModel):
    """
    Pydantic schema for updating an existing Address. All fields are optional.
    """
    address_type: Optional[str] = Field(None, max_length=50, description="Type of address (e.g. Home, Work, Other)")
    house_number: Optional[str] = Field(None, max_length=255, description="House/flat/building number")
    landmark: Optional[str] = Field(None, max_length=255, description="Nearby landmark")
    street: Optional[str] = Field(None, max_length=255, description="Street name or locality")
    city: Optional[str] = Field(None, max_length=100, description="City name")
    state: Optional[str] = Field(None, max_length=100, description="State name")
    pincode: Optional[str] = Field(None, max_length=20, description="Postal PIN code")
    latitude: Optional[float] = Field(None, description="Geographic latitude coordinate")
    longitude: Optional[float] = Field(None, description="Geographic longitude coordinate")
    is_default: Optional[bool] = Field(None, description="Whether this is the default address")

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not re.match(r"^[a-zA-Z0-9\s\-]{3,10}$", v):
            raise ValueError("Invalid pincode format")
        return v

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if not -90.0 <= v <= 90.0:
                raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if not -180.0 <= v <= 180.0:
                raise ValueError("Longitude must be between -180 and 180")
        return v

class AddressResponse(AddressBase):
    """
    Pydantic schema for returning Address information.
    Includes database-generated fields and supports ORM serialization.
    """
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
