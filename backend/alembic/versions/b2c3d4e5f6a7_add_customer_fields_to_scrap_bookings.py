"""add_customer_fields_to_scrap_bookings

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-10 10:00:00.000000

Adds customer_name and customer_phone columns to scrap_bookings table,
matching the pattern already used in maintenance_bookings.
These fields allow the admin panel to display form-entered customer details
directly instead of relying on user profile or notes-parsing.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(bind, table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(bind)
    columns = [c["name"] for c in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    """Add customer_name and customer_phone to scrap_bookings."""
    bind = op.get_bind()

    if not _column_exists(bind, 'scrap_bookings', 'customer_name'):
        op.add_column(
            'scrap_bookings',
            sa.Column('customer_name', sa.String(length=255), nullable=True,
                      comment='Customer name as entered in the booking form')
        )

    if not _column_exists(bind, 'scrap_bookings', 'customer_phone'):
        op.add_column(
            'scrap_bookings',
            sa.Column('customer_phone', sa.String(length=20), nullable=True,
                      comment='Customer phone as entered in the booking form')
        )


def downgrade() -> None:
    """Remove customer_name and customer_phone from scrap_bookings."""
    bind = op.get_bind()

    if _column_exists(bind, 'scrap_bookings', 'customer_phone'):
        op.drop_column('scrap_bookings', 'customer_phone')

    if _column_exists(bind, 'scrap_bookings', 'customer_name'):
        op.drop_column('scrap_bookings', 'customer_name')
