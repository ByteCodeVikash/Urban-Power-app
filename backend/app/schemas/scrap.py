from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class ScrapItemBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the scrap item")
    image: Optional[str] = Field(None, max_length=1024, description="Image URL")
    description: Optional[str] = Field(None, max_length=1024, description="Description of the item")
    price_per_kg: float = Field(..., ge=0.0, description="Price per kilogram")
    active: bool = Field(True, description="Active status")

class ScrapItemCreate(ScrapItemBase):
    category_id: UUID

class ScrapItemResponse(ScrapItemBase):
    id: UUID
    category_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScrapCategoryBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the scrap category")
    icon: Optional[str] = Field(None, max_length=1024, description="Icon identifier or URL")
    image: Optional[str] = Field(None, max_length=1024, description="Display image URL")
    description: Optional[str] = Field(None, max_length=1024, description="Category description")
    active: bool = Field(True, description="Active status")

class ScrapCategoryCreate(ScrapCategoryBase):
    pass

class ScrapCategoryResponse(ScrapCategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    items: List[ScrapItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
