from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.maintenance import MaintenanceCategoryResponse, MaintenanceServiceResponse
from app.services import maintenance as maintenance_service

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("/categories", response_model=List[MaintenanceCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """
    Retrieve all active maintenance categories along with their active services.
    """
    return maintenance_service.get_active_categories(db=db)

@router.get("/services", response_model=List[MaintenanceServiceResponse])
def get_services(category_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """
    Retrieve all active maintenance services. Optional filtering by category_id query parameter.
    """
    return maintenance_service.get_active_services(db=db, category_id=category_id)
