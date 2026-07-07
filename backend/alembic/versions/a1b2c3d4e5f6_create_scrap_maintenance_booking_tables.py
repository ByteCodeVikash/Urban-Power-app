"""create_scrap_maintenance_booking_tables

Revision ID: a1b2c3d4e5f6
Revises: cc6815713133
Create Date: 2026-07-07 13:30:00.000000

Adds the three tables that were modelled but never migrated:
  - scrap_bookings
  - maintenance_bookings
  - booking_status_history
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'cc6815713133'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create scrap_bookings, maintenance_bookings, booking_status_history tables."""

    # ── scrap_bookings ────────────────────────────────────────────────────────
    op.create_table(
        'scrap_bookings',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('scrap_item_id', sa.UUID(), nullable=True),
        sa.Column('address_id', sa.UUID(), nullable=True),
        sa.Column('address_text', sa.String(length=1024), nullable=True),
        sa.Column('booking_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('time_slot', sa.String(length=100), nullable=True),
        sa.Column('category_name', sa.String(length=255), nullable=True),
        sa.Column('item_name', sa.String(length=255), nullable=True),
        sa.Column('estimated_weight_kg', sa.Float(), nullable=True),
        sa.Column('estimated_value', sa.Float(), nullable=True),
        sa.Column('price_per_kg', sa.Float(), nullable=True),
        sa.Column(
            'status',
            sa.Enum(
                'requested', 'assigned', 'in_progress', 'completed', 'cancelled',
                name='scrap_booking_status_enum',
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column('notes', sa.String(length=1024), nullable=True),
        sa.Column('photos', sa.JSON(), nullable=True),
        sa.Column('booking_reference', sa.String(length=50), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['scrap_item_id'], ['scrap_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_reference', name='uq_scrap_bookings_booking_reference'),
    )
    op.create_index(op.f('ix_scrap_bookings_id'), 'scrap_bookings', ['id'], unique=False)
    op.create_index(op.f('ix_scrap_bookings_user_id'), 'scrap_bookings', ['user_id'], unique=False)
    op.create_index(op.f('ix_scrap_bookings_scrap_item_id'), 'scrap_bookings', ['scrap_item_id'], unique=False)
    op.create_index(op.f('ix_scrap_bookings_address_id'), 'scrap_bookings', ['address_id'], unique=False)

    # ── maintenance_bookings ──────────────────────────────────────────────────
    op.create_table(
        'maintenance_bookings',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('address_id', sa.UUID(), nullable=True),
        sa.Column('address_text', sa.String(length=1024), nullable=True),
        sa.Column('booking_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('service_ids', sa.JSON(), nullable=True),
        sa.Column('service_names', sa.JSON(), nullable=True),
        sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            'status',
            sa.Enum(
                'pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled',
                name='maintenance_booking_status_enum',
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column('notes', sa.String(length=1024), nullable=True),
        sa.Column('photos', sa.JSON(), nullable=True),
        sa.Column('booking_reference', sa.String(length=50), nullable=False),
        sa.Column('customer_name', sa.String(length=255), nullable=True),
        sa.Column('customer_phone', sa.String(length=20), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['address_id'], ['addresses.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_reference', name='uq_maintenance_bookings_booking_reference'),
    )
    op.create_index(op.f('ix_maintenance_bookings_id'), 'maintenance_bookings', ['id'], unique=False)
    op.create_index(op.f('ix_maintenance_bookings_user_id'), 'maintenance_bookings', ['user_id'], unique=False)
    op.create_index(op.f('ix_maintenance_bookings_address_id'), 'maintenance_bookings', ['address_id'], unique=False)

    # ── booking_status_history ────────────────────────────────────────────────
    op.create_table(
        'booking_status_history',
        sa.Column('booking_id', sa.String(length=64), nullable=False),
        sa.Column('booking_type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('updated_by', sa.String(length=64), nullable=True),
        sa.Column('updated_by_name', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_booking_status_history_id'), 'booking_status_history', ['id'], unique=False)
    op.create_index(op.f('ix_booking_status_history_booking_id'), 'booking_status_history', ['booking_id'], unique=False)


def downgrade() -> None:
    """Drop the three tables created in upgrade."""
    op.drop_index(op.f('ix_booking_status_history_booking_id'), table_name='booking_status_history')
    op.drop_index(op.f('ix_booking_status_history_id'), table_name='booking_status_history')
    op.drop_table('booking_status_history')

    op.drop_index(op.f('ix_maintenance_bookings_address_id'), table_name='maintenance_bookings')
    op.drop_index(op.f('ix_maintenance_bookings_user_id'), table_name='maintenance_bookings')
    op.drop_index(op.f('ix_maintenance_bookings_id'), table_name='maintenance_bookings')
    op.drop_table('maintenance_bookings')

    op.drop_index(op.f('ix_scrap_bookings_address_id'), table_name='scrap_bookings')
    op.drop_index(op.f('ix_scrap_bookings_scrap_item_id'), table_name='scrap_bookings')
    op.drop_index(op.f('ix_scrap_bookings_user_id'), table_name='scrap_bookings')
    op.drop_index(op.f('ix_scrap_bookings_id'), table_name='scrap_bookings')
    op.drop_table('scrap_bookings')
