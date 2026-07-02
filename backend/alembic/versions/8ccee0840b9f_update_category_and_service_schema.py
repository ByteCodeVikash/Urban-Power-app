"""update_category_and_service_schema

Revision ID: 8ccee0840b9f
Revises: 9ff0d0fe8592
Create Date: 2026-06-23 20:20:59.119485

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ccee0840b9f'
down_revision: Union[str, Sequence[str], None] = '9ff0d0fe8592'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # categories table updates
    op.add_column('categories', sa.Column('icon', sa.String(length=1024), nullable=True))
    op.alter_column('categories', 'image_url', new_column_name='image')
    op.alter_column('categories', 'is_active', new_column_name='active')

    # services table updates
    op.add_column('services', sa.Column('duration', sa.Integer(), nullable=True))
    op.alter_column('services', 'image_url', new_column_name='image')
    op.alter_column('services', 'is_active', new_column_name='active')
    op.alter_column('services', 'base_price', new_column_name='price')


def downgrade() -> None:
    """Downgrade schema."""
    # services table rollback
    op.alter_column('services', 'price', new_column_name='base_price')
    op.alter_column('services', 'active', new_column_name='is_active')
    op.alter_column('services', 'image', new_column_name='image_url')
    op.drop_column('services', 'duration')

    # categories table rollback
    op.alter_column('categories', 'active', new_column_name='is_active')
    op.alter_column('categories', 'image', new_column_name='image_url')
    op.drop_column('categories', 'icon')

