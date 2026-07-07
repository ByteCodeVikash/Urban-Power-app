import logging
import bcrypt
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.api.deps import get_current_active_user
from app.models.admin import Admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# Request/Response Schemas
class AdminLoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Admin username or email address")
    password: str = Field(..., description="Admin plain text password")

class AdminResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class AdminLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    admin: AdminResponse

class AdminMeResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    permissions: List[str]

# Role Permissions Mapping in Backend
ROLE_PERMISSIONS = {
    "super_admin": [
        "dashboard.view",
        "orders.view",
        "orders.edit",
        "orders.assign",
        "payments.view",
        "payments.refund",
        "users.view",
        "users.edit",
        "services.manage",
        "settings.manage",
        "reports.view",
        "coupons.manage",
        "cms.manage",
        "support.manage",
        "technicians.view",
        "technicians.manage",
    ],
    "admin": [
        "dashboard.view",
        "orders.view",
        "orders.edit",
        "orders.assign",
        "payments.view",
        "users.view",
        "users.edit",
        "services.manage",
        "settings.manage",
        "reports.view",
        "coupons.manage",
        "cms.manage",
        "support.manage",
        "technicians.view",
        "technicians.manage",
    ],
    "operations_manager": [
        "dashboard.view",
        "orders.view",
        "orders.edit",
        "orders.assign",
        "users.view",
        "services.manage",
        "technicians.view",
        "technicians.manage",
    ],
    "dispatcher": [
        "dashboard.view",
        "orders.view",
        "orders.edit",
        "orders.assign",
        "technicians.view",
    ],
    "finance_manager": [
        "dashboard.view",
        "payments.view",
        "payments.refund",
        "reports.view",
    ],
    "support_executive": [
        "dashboard.view",
        "orders.view",
        "users.view",
        "support.manage",
    ],
    "technician_manager": [
        "dashboard.view",
        "services.manage",
        "technicians.view",
        "technicians.manage",
    ],
    "content_manager": [
        "dashboard.view",
        "services.manage",
        "cms.manage",
    ],
}

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an admin using username or email and password.
    Returns Access and Refresh tokens.
    """
    # Find admin by username or email
    admin = db.query(Admin).filter(
        (Admin.username == payload.username_or_email) | 
        (Admin.email == payload.username_or_email)
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    # Verify password hash
    is_valid = bcrypt.checkpw(
        payload.password.encode("utf-8"), 
        admin.password_hash.encode("utf-8")
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin account is inactive"
        )

    # Generate JWT tokens (matching existing utility)
    access_token = create_access_token(
        user_id=str(admin.id),
        phone="",
        role=admin.role
    )
    refresh_token = create_refresh_token(
        user_id=str(admin.id),
        phone="",
        role=admin.role
    )

    return AdminLoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        admin=admin
    )

@router.get("/me", response_model=AdminMeResponse)
def get_admin_me(current_user=Depends(get_current_active_user)):
    """
    Retrieve logged-in admin details along with permissions.
    """
    # Ensure current user is an admin by checking if the object is Admin model or has role
    # and has attributes expected for admin dashboard
    # Wait, check if they are in admins table, or verify role is not 'client'
    if current_user.role == "client":
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Access denied: Not an administrative user"
         )

    # Resolve permissions based on role
    role = current_user.role
    normalized_role = role.lower().replace(" ", "_")
    permissions = ROLE_PERMISSIONS.get(normalized_role, [])

    # If it's a super_admin role, allow everything
    if normalized_role in ("super_admin", "super admin"):
        # Just in case, grant all possible permission keys
        permissions = ROLE_PERMISSIONS["super_admin"]

    return AdminMeResponse(
        id=str(current_user.id),
        name=current_user.full_name or current_user.username if hasattr(current_user, 'username') else "Administrator",
        email=current_user.email,
        role=current_user.role,
        permissions=permissions
    )
