from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.scrap import ScrapCategoryResponse, ScrapItemResponse
from app.services import scrap as scrap_service

router = APIRouter(prefix="/scrap", tags=["scrap"])

@router.get("/categories", response_model=List[ScrapCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Retrieve all active scrap categories along with their items.
    """
    return scrap_service.get_active_categories(db=db)

@router.get("/items/{item_id}", response_model=ScrapItemResponse)
def get_item_details(item_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve details of a specific active scrap item.
    """
    item = scrap_service.get_scrap_item_by_id(db=db, item_id=item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scrap item not found or inactive"
        )
    return item
