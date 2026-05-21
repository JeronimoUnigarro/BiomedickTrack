"""initial fastapi schema

Revision ID: 202605080001
Revises:
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa


revision = "202605080001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("nombre", sa.String(120), nullable=False),
        sa.Column("apellido", sa.String(120), nullable=False, server_default=""),
        sa.Column("telefono", sa.String(40)),
        sa.Column("rol", sa.Enum("GERENCIA", "BIOMEDICO", name="rolusuario"), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("two_factor_code_hash", sa.String(255)),
        sa.Column("two_factor_expires_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"])

    op.create_table(
        "equipos",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("nombre", sa.String(180), nullable=False),
        sa.Column("marca", sa.String(120), nullable=False),
        sa.Column("modelo", sa.String(120), nullable=False),
        sa.Column("serie", sa.String(120), nullable=False, unique=True),
        sa.Column("fabricante", sa.String(180), nullable=False),
        sa.Column("pais_origen", sa.String(120), nullable=False),
        sa.Column("ano_fabricacion", sa.Integer(), nullable=False),
        sa.Column("fecha_adquisicion", sa.Date(), nullable=False),
        sa.Column("costo_adquisicion", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("proveedor", sa.String(180), nullable=False),
        sa.Column("ubicacion", sa.String(180), nullable=False),
        sa.Column("area", sa.String(180), nullable=False),
        sa.Column("responsable", sa.String(180), nullable=False),
        sa.Column("estado", sa.Enum("activo", "mantenimiento", "inactivo", name="estadoequipo"), nullable=False),
        sa.Column("criticidad", sa.Enum("alta", "media", "baja", name="criticidadequipo"), nullable=False),
        sa.Column("especificaciones", sa.JSON(), nullable=False),
        sa.Column("accesorios", sa.JSON(), nullable=False),
        sa.Column("observaciones", sa.Text()),
        sa.Column("ultimo_mantenimiento", sa.Date()),
        sa.Column("proximo_mantenimiento", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_equipos_serie", "equipos", ["serie"])

    op.create_table(
        "mantenimientos",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("equipo_id", sa.String(36), sa.ForeignKey("equipos.id", ondelete="CASCADE")),
        sa.Column("tipo", sa.Enum("preventivo", "correctivo", name="tipomantenimiento"), nullable=False),
        sa.Column("fecha", sa.Date(), nullable=False),
        sa.Column("tecnico_responsable", sa.String(180), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("observaciones", sa.Text()),
        sa.Column("repuestos", sa.JSON(), nullable=False),
        sa.Column("costo", sa.Numeric(14, 2)),
        sa.Column("duracion", sa.Numeric(6, 2)),
        sa.Column("estado_anterior", sa.Enum("activo", "mantenimiento", "inactivo", name="estadoequipo")),
        sa.Column("estado_posterior", sa.Enum("activo", "mantenimiento", "inactivo", name="estadoequipo")),
        sa.Column("created_by_id", sa.String(36), sa.ForeignKey("usuarios.id", ondelete="SET NULL")),
        sa.Column("created_by_nombre", sa.String(180), nullable=False, server_default="Sistema"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_mantenimientos_equipo_id", "mantenimientos", ["equipo_id"])

    op.create_table(
        "alertas",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("equipo_id", sa.String(36), sa.ForeignKey("equipos.id", ondelete="CASCADE")),
        sa.Column("tipo", sa.Enum("mantenimiento_vencido", "mantenimiento_proximo", "equipo_critico", "equipo_inactivo", name="tipoalerta"), nullable=False),
        sa.Column("mensaje", sa.Text(), nullable=False),
        sa.Column("prioridad", sa.Enum("alta", "media", "baja", name="prioridadalerta"), nullable=False),
        sa.Column("fecha", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("leida", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_alertas_equipo_id", "alertas", ["equipo_id"])

    op.create_table(
        "bitacora",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("equipo_id", sa.String(36), sa.ForeignKey("equipos.id", ondelete="CASCADE")),
        sa.Column("fecha", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("usuario", sa.String(180), nullable=False),
        sa.Column("accion", sa.String(180), nullable=False),
        sa.Column("detalles", sa.Text(), nullable=False),
        sa.Column("firma_digital", sa.String(120)),
    )
    op.create_index("ix_bitacora_equipo_id", "bitacora", ["equipo_id"])


def downgrade() -> None:
    op.drop_table("bitacora")
    op.drop_table("alertas")
    op.drop_table("mantenimientos")
    op.drop_table("equipos")
    op.drop_table("usuarios")
