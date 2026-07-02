from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.models.maintenance import MaintenanceCategory, MaintenanceService

def get_active_categories(db: Session) -> List[MaintenanceCategory]:
    """
    Retrieve all active maintenance categories along with their active services.
    """
    # Use selectinload to eagerly load active services to prevent N+1 queries.
    query = (
        select(MaintenanceCategory)
        .where(MaintenanceCategory.active == True)
        .options(
            selectinload(MaintenanceCategory.services)
        )
    )
    result = db.execute(query).scalars().all()
    
    # Filter the loaded services to keep only active ones
    for category in result:
        category.services = [service for service in category.services if service.active]
        
    return result

def get_active_services(db: Session, category_id: Optional[UUID] = None) -> List[MaintenanceService]:
    """
    Retrieve all active maintenance services, optionally filtered by category_id.
    """
    query = select(MaintenanceService).where(MaintenanceService.active == True)
    if category_id is not None:
        query = query.where(MaintenanceService.category_id == category_id)
        
    return db.execute(query).scalars().all()
