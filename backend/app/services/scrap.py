from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.models.scrap import ScrapCategory, ScrapItem

def get_active_categories(db: Session) -> List[ScrapCategory]:
    """
    Retrieve all active scrap categories along with their active items.
    """
    # Use selectinload to eagerly load active items to prevent N+1 queries.
    query = (
        select(ScrapCategory)
        .where(ScrapCategory.active == True)
        .options(
            selectinload(ScrapCategory.items)
        )
    )
    result = db.execute(query).scalars().all()
    
    # Filter the loaded items to keep only active ones
    for category in result:
        category.items = [item for item in category.items if item.active]
        
    return result

def get_scrap_item_by_id(db: Session, item_id: UUID) -> Optional[ScrapItem]:
    """
    Retrieve a scrap item by its ID.
    """
    query = select(ScrapItem).where(ScrapItem.id == item_id, ScrapItem.active == True)
    return db.execute(query).scalar_one_or_none()
