import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, Float, ForeignKey, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

class ScrapCategory(BaseModel):
    """
    Database model representing scrap categories (e.g. Paper, Plastic, Metal).
    """
    __tablename__ = "scrap_categories"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the scrap category"
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
        doc="Detailed description of the scrap category"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the category is active"
    )

    items: Mapped[List["ScrapItem"]] = relationship(
        "ScrapItem",
        back_populates="category",
        cascade="all, delete-orphan",
        doc="Scrap items belonging to this category"
    )


class ScrapItem(BaseModel):
    """
    Database model representing scrap items (e.g. Newspaper, Plastic Bottles, Copper).
    """
    __tablename__ = "scrap_items"

    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrap_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key to the parent scrap category"
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Name of the scrap item"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Display image URL"
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(1024),
        nullable=True,
        doc="Detailed description of the scrap item"
    )
    price_per_kg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Price per kilogram for this item"
    )
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Indicates whether the item is active"
    )

    category: Mapped["ScrapCategory"] = relationship(
        "ScrapCategory",
        back_populates="items",
        doc="Parent category of the scrap item"
    )
