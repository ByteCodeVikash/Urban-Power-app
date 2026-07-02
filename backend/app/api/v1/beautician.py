from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.beautician import BeauticianCategoryResponse, BeauticianServiceResponse
from app.services import beautician as beautician_service

router = APIRouter(prefix="/beautician", tags=["beautician"])

@router.get("/categories", response_model=List[BeauticianCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Retrieve all active beautician categories along with their active services.
    """
    return beautician_service.get_active_categories(db=db)

@router.get("/services", response_model=List[BeauticianServiceResponse])
def get_services(category_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """
    Retrieve all active beautician services. Optional filtering by category_id query parameter.
    """
    return beautician_service.get_active_services(db=db, category_id=category_id)
