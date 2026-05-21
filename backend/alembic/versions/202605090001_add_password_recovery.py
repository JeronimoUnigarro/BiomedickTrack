"""add password recovery fields

Revision ID: 202605090001
Revises: 202605080001
Create Date: 2026-05-09
"""
from alembic import op
import sqlalchemy as sa


revision = "202605090001"
down_revision = "202605080001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("usuarios", sa.Column("password_reset_token_hash", sa.String(64), nullable=True))
    op.add_column("usuarios", sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_usuarios_password_reset_token_hash", "usuarios", ["password_reset_token_hash"])


def downgrade() -> None:
    op.drop_index("ix_usuarios_password_reset_token_hash", table_name="usuarios")
    op.drop_column("usuarios", "password_reset_expires_at")
    op.drop_column("usuarios", "password_reset_token_hash")
