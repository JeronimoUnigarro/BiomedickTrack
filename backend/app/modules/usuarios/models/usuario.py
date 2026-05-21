from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import uuid4

from app.core.database import Base
from app.shared.enums import RolUsuario


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    apellido: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(40))
    rol: Mapped[RolUsuario] = mapped_column(Enum(RolUsuario), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    two_factor_code_hash: Mapped[str | None] = mapped_column(String(255))
    two_factor_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    password_reset_token_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    password_reset_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    mantenimientos = relationship("Mantenimiento", back_populates="creador")
