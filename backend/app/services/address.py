from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate

def create_address(db: Session, user_id: UUID, address_in: AddressCreate) -> Address:
    """
    Create a new address for a user. Handles default address logic.
    """
    address_data = address_in.model_dump()
    address_data["user_id"] = user_id

    # Auto-geocode if coordinates are missing
    if address_data.get("latitude") is None or address_data.get("longitude") is None:
        try:
            from app.services.geocoding import geocoding_service
            full_address = f"{address_data.get('house_number') or ''} {address_data.get('street') or ''}, {address_data.get('city') or ''}, {address_data.get('state') or ''} {address_data.get('pincode') or ''}".strip()
            coords = geocoding_service.geocode_address(full_address)
            if coords:
                address_data["latitude"] = coords.get("latitude")
                address_data["longitude"] = coords.get("longitude")
        except Exception:
            # Prevent failures in external service from blocking core address creation
            pass


    # Check if user has any existing addresses
    existing_count = db.query(Address).filter(Address.user_id == user_id).count()
    
    if existing_count == 0:
        # If this is the user's first address, it must be the default address
        address_data["is_default"] = True
    elif address_data.get("is_default"):
        # If this address is set to default, set all other user addresses to not default
        db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})

    db_address = Address(**address_data)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def get_address(db: Session, address_id: UUID, user_id: UUID) -> Optional[Address]:
    """
    Retrieve a specific address belonging to a user.
    """
    return db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()

def get_user_addresses(db: Session, user_id: UUID) -> List[Address]:
    """
    List all addresses belonging to a user, ordered with the default address first.
    """
    return db.query(Address).filter(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()

def update_address(db: Session, address_id: UUID, user_id: UUID, address_in: AddressUpdate) -> Optional[Address]:
    """
    Update an existing address. Handles default address logic.
    """
    db_address = get_address(db, address_id, user_id)
    if not db_address:
        return None

    update_data = address_in.model_dump(exclude_unset=True)

    # Auto-geocode if address fields are modified but coordinates are not explicitly updated
    address_fields_changed = any(k in update_data for k in ["street", "city", "state", "pincode", "house_number"])
    coords_provided = "latitude" in update_data or "longitude" in update_data
    if address_fields_changed and not coords_provided:
        try:
            from app.services.geocoding import geocoding_service
            street = update_data.get("street", db_address.street)
            city = update_data.get("city", db_address.city)
            state = update_data.get("state", db_address.state)
            pincode = update_data.get("pincode", db_address.pincode)
            house_number = update_data.get("house_number", db_address.house_number)
            full_address = f"{house_number or ''} {street or ''}, {city or ''}, {state or ''} {pincode or ''}".strip()
            coords = geocoding_service.geocode_address(full_address)
            if coords:
                update_data["latitude"] = coords.get("latitude")
                update_data["longitude"] = coords.get("longitude")
        except Exception:
            # Prevent failures in external service from blocking address updates
            pass


    if "is_default" in update_data:
        new_is_default = update_data["is_default"]
        if new_is_default is True:
            # If changing this address to default, unset other default addresses
            db.query(Address).filter(Address.user_id == user_id).update({"is_default": False})
        elif new_is_default is False and db_address.is_default:
            # If trying to unset default on the currently default address, check if another address exists
            other_address = db.query(Address).filter(Address.user_id == user_id, Address.id != address_id).first()
            if other_address:
                other_address.is_default = True
            else:
                # If it's the only address, it must remain default
                update_data["is_default"] = True

    for key, val in update_data.items():
        setattr(db_address, key, val)

    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, address_id: UUID, user_id: UUID) -> bool:
    """
    Delete a specific address. If the default address is deleted, automatically reassign default.
    """
    db_address = get_address(db, address_id, user_id)
    if not db_address:
        return False

    was_default = db_address.is_default

    db.delete(db_address)
    
    if was_default:
        # If the deleted address was the default, assign default to another address of the user
        other_address = db.query(Address).filter(Address.user_id == user_id, Address.id != address_id).first()
        if other_address:
            other_address.is_default = True

    db.commit()
    return True
