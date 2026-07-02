import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, ForeignKey, Numeric, UUID, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class MaintenanceCategory(BaseModel):
    """
    Database model representing maintenance categories (e.g. AC Repair, Plumbing, Electrical).
    """
    __tablename__ = "maintenance_categories"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the maintenance category"
    )
    icon: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Icon identifier or icon image URL"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Display image URL"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Detailed description of the maintenance category"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the category is active"
    )

    services: Mapped[List["MaintenanceService"]] = relationship(
        "MaintenanceService",
        back_populates="category",
        cascade="all, delete-orphan",
        doc="Maintenance services belonging to this category"
    )


class MaintenanceService(BaseModel):
    """
    Database model representing individual maintenance services offered (e.g. AC Service, Tap Repair).
    """
    __tablename__ = "maintenance_services"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("maintenance_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the parent maintenance category"
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the maintenance service"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Display image URL"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Detailed description of the maintenance service"
    )
    price: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        doc="Price for the maintenance service"
    )
    duration: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Duration of the service in minutes"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the service is active"
    )

    category: Mapped["MaintenanceCategory"] = relationship(
        "MaintenanceCategory",
        back_populates="services",
        doc="Parent category of the maintenance service"
    )
