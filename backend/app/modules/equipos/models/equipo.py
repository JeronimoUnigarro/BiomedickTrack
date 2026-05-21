from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Date, DateTime, Enum, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from app.core.database import Base
from app.shared.enums import CriticidadEquipo, EstadoEquipo


class Equipo(Base):
    __tablename__ = "equipos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    nombre: Mapped[str] = mapped_column(String(180), nullable=False)
    marca: Mapped[str] = mapped_column(String(120), nullable=False)
    modelo: Mapped[str] = mapped_column(String(120), nullable=False)
    serie: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    fabricante: Mapped[str] = mapped_column(String(180), nullable=False)
    pais_origen: Mapped[str] = mapped_column(String(120), nullable=False)
    ano_fabricacion: Mapped[int] = mapped_column(nullable=False)
    fecha_adquisicion: Mapped[date] = mapped_column(Date, nullable=False)
    costo_adquisicion: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    proveedor: Mapped[str] = mapped_column(String(180), nullable=False)
    ubicacion: Mapped[str] = mapped_column(String(180), nullable=False)
    area: Mapped[str] = mapped_column(String(180), nullable=False)
    responsable: Mapped[str] = mapped_column(String(180), nullable=False)
    estado: Mapped[EstadoEquipo] = mapped_column(Enum(EstadoEquipo), default=EstadoEquipo.activo)
    criticidad: Mapped[CriticidadEquipo] = mapped_column(Enum(CriticidadEquipo), default=CriticidadEquipo.media)
    especificaciones: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    accesorios: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    observaciones: Mapped[str | None] = mapped_column(Text)
    ultimo_mantenimiento: Mapped[date | None] = mapped_column(Date)
    proximo_mantenimiento: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    mantenimientos = relationship("Mantenimiento", back_populates="equipo", cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="equipo", cascade="all, delete-orphan")
    bitacoras = relationship("Bitacora", back_populates="equipo", cascade="all, delete-orphan")
