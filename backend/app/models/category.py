import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class Category(BaseModel):
    """
    Category database model representing classification/grouping of services.
    """
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the service category"
    )
    icon: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Icon identifier or icon image URL"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Detailed description of the category"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="URL or path to the category's display image"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the category is active"
    )

    services: Mapped[List["Service"]] = relationship(
        "Service",
        back_populates="category",
        cascade="all, delete-orphan",
        doc="Services belonging to this category"
    )
