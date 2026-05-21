from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Date, DateTime, Enum, ForeignKey, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from app.core.database import Base
from app.shared.enums import EstadoEquipo, TipoMantenimiento


class Mantenimiento(Base):
    __tablename__ = "mantenimientos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    equipo_id: Mapped[str] = mapped_column(ForeignKey("equipos.id", ondelete="CASCADE"), index=True)
    tipo: Mapped[TipoMantenimiento] = mapped_column(Enum(TipoMantenimiento), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    tecnico_responsable: Mapped[str] = mapped_column(String(180), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    observaciones: Mapped[str | None] = mapped_column(Text)
    repuestos: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    costo: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    duracion: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    estado_anterior: Mapped[EstadoEquipo | None] = mapped_column(Enum(EstadoEquipo))
    estado_posterior: Mapped[EstadoEquipo | None] = mapped_column(Enum(EstadoEquipo))
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"))
    created_by_nombre: Mapped[str] = mapped_column(String(180), default="Sistema")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    equipo = relationship("Equipo", back_populates="mantenimientos")
    creador = relationship("Usuario", back_populates="mantenimientos")
