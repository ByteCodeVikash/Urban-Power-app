from typing import Optional
from pydantic import BaseModel, Field

class GeocodeResponse(BaseModel):
    """
    Response schema for Geocoding API endpoint.
    """
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    formatted_address: str = Field(..., description="Clean, formatted address from Google Maps")
    success: bool = Field(..., description="Indicates if the lookup succeeded")

class ReverseGeocodeResponse(BaseModel):
    """
    Response schema for Reverse Geocoding API endpoint.
    """
    formatted_address: str = Field(..., description="Clean, formatted address from Google Maps")
    street: Optional[str] = Field(None, description="Street/locality name")
    city: Optional[str] = Field(None, description="City/town/locality")
    state: Optional[str] = Field(None, description="State/province")
    pincode: Optional[str] = Field(None, description="ZIP/Postal PIN code")
    success: bool = Field(..., description="Indicates if the lookup succeeded")
