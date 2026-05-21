from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from app.core.database import Base
from app.shared.enums import PrioridadAlerta, TipoAlerta


class Alerta(Base):
    __tablename__ = "alertas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    equipo_id: Mapped[str] = mapped_column(ForeignKey("equipos.id", ondelete="CASCADE"), index=True)
    tipo: Mapped[TipoAlerta] = mapped_column(Enum(TipoAlerta), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    prioridad: Mapped[PrioridadAlerta] = mapped_column(Enum(PrioridadAlerta), nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    leida: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    equipo = relationship("Equipo", back_populates="alertas")
