from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.api.deps import get_current_active_user


router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def get_users_status():
    return {
        "status": "active",
        "message": "Users API v1 endpoint is functional."
    }

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    # Check if user with same email exists
    existing_user_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if user with same phone exists (only if phone is provided)
    if user_in.phone:
        existing_user_phone = db.query(User).filter(User.phone == user_in.phone).first()
        if existing_user_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
            
    # Create the user object
    user_data = user_in.model_dump()
    db_user = User(**user_data)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile.
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get user by ID.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: UUID, user_in: UserUpdate, db: Session = Depends(get_db)):
    """
    Update user profile by ID. Supports partial updates and validates email/phone uniqueness.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Exclude unset fields to handle partial updates
    update_data = user_in.model_dump(exclude_unset=True)

    # Check email uniqueness
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_user_email = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Check phone uniqueness
    if "phone" in update_data and update_data["phone"] != db_user.phone:
        phone_val = update_data["phone"]
        if phone_val:
            existing_user_phone = db.query(User).filter(User.phone == phone_val).first()
            if existing_user_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered"
                )

    # Apply updates
    for key, val in update_data.items():
        setattr(db_user, key, val)

    db.commit()
    db.refresh(db_user)
    return db_user


