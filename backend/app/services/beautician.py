from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.models.category import Category
from app.models.service import Service

def get_active_categories(db: Session) -> List[Category]:
    """
    Retrieve all active categories along with their active services.
    """
    # Use selectinload to eagerly load active services to prevent N+1 queries.
    query = (
        select(Category)
        .where(Category.active == True)
        .options(
            selectinload(Category.services)
        )
    )
    result = db.execute(query).scalars().all()
    
    # Filter the loaded services to keep only active ones
    for category in result:
        category.services = [service for service in category.services if service.active]
        
    return result

def get_active_services(db: Session, category_id: Optional[UUID] = None) -> List[Service]:
    """
    Retrieve all active services, optionally filtered by category_id.
    """
    query = select(Service).where(Service.active == True)
    if category_id is not None:
        query = query.where(Service.category_id == category_id)
        
    return db.execute(query).scalars().all()
