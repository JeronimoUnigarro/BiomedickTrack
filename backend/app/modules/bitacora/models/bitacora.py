from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from app.core.database import Base


class Bitacora(Base):
    __tablename__ = "bitacora"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    equipo_id: Mapped[str] = mapped_column(ForeignKey("equipos.id", ondelete="CASCADE"), index=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    usuario: Mapped[str] = mapped_column(String(180), nullable=False)
    accion: Mapped[str] = mapped_column(String(180), nullable=False)
    detalles: Mapped[str] = mapped_column(Text, nullable=False)
    firma_digital: Mapped[str | None] = mapped_column(String(120))

    equipo = relationship("Equipo", back_populates="bitacoras")
