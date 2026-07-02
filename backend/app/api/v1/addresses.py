from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate
from app.services import address as address_service
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/addresses", tags=["addresses"])

@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Save a new address for the current authenticated user.
    """
    return address_service.create_address(db=db, user_id=current_user.id, address_in=address_in)

@router.get("/", response_model=List[AddressResponse])
def list_addresses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all saved addresses for the current authenticated user.
    """
    return address_service.get_user_addresses(db=db, user_id=current_user.id)

@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: UUID,
    address_in: AddressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a saved address.
    """
    db_address = address_service.get_address(db=db, address_id=address_id, user_id=current_user.id)
    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    return address_service.update_address(
        db=db, address_id=address_id, user_id=current_user.id, address_in=address_in
    )

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a saved address.
    """
    db_address = address_service.get_address(db=db, address_id=address_id, user_id=current_user.id)
    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    address_service.delete_address(db=db, address_id=address_id, user_id=current_user.id)
    return
