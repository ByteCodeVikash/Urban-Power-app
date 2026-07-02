from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class BeauticianServiceResponse(BaseModel):
    id: UUID = Field(..., description="Unique identifier of the service")
    category_id: UUID = Field(..., description="Foreign key to the parent category")
    name: str = Field(..., max_length=255, description="Name of the service")
    image: Optional[str] = Field(None, max_length=1024, description="Display image URL")
    description: Optional[str] = Field(None, max_length=1024, description="Detailed description of the service")
    duration: Optional[int] = Field(None, description="Duration of the service in minutes")
    price: float = Field(..., ge=0.0, description="Price for the service")
    active: bool = Field(True, description="Indicates whether the service is active")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BeauticianCategoryResponse(BaseModel):
    id: UUID = Field(..., description="Unique identifier of the category")
    name: str = Field(..., max_length=255, description="Name of the category")
    icon: Optional[str] = Field(None, max_length=1024, description="Icon identifier or URL")
    image: Optional[str] = Field(None, max_length=1024, description="Display image URL")
    description: Optional[str] = Field(None, max_length=1024, description="Detailed description of the category")
    active: bool = Field(True, description="Indicates whether the category is active")
    created_at: datetime
    updated_at: datetime
    services: List[BeauticianServiceResponse] = Field(default=[], description="List of services belonging to this category")

    model_config = ConfigDict(from_attributes=True)
