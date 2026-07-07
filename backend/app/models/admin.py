from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel

class Admin(BaseModel):
    """
    Admin database model representing administrative console users.
    """
    __tablename__ = "admins"

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        doc="Unique username of the admin"
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="Primary email address of the admin used for authentication"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Hashed password"
    )
    role: Mapped[str] = mapped_column(
        String(50),
        default="admin",
        nullable=False,
        doc="Role of the admin (e.g. super_admin, admin, operations_manager, dispatcher)"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the admin account is active"
    )

    @property
    def full_name(self) -> str:
        return self.username

    @property
    def phone(self) -> str:
        return ""

    @property
    def is_verified(self) -> bool:
        return True
