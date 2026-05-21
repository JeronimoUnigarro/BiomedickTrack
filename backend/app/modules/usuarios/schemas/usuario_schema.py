from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.shared.enums import RolUsuario


FrontendRole = str


def role_to_db(role: FrontendRole | RolUsuario) -> RolUsuario:
    if isinstance(role, RolUsuario):
        return role
    normalized = role.lower()
    if normalized in {"gerencia", "gerente", "admin", "GERENCIA".lower()}:
        return RolUsuario.GERENCIA
    if normalized in {"ingeniero", "biomedico", "biomédico", "BIOMEDICO".lower()}:
        return RolUsuario.BIOMEDICO
    raise ValueError("Rol invalido")


def role_to_frontend(role: RolUsuario) -> str:
    return "gerencia" if role == RolUsuario.GERENCIA else "ingeniero"


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str = Field(min_length=2, max_length=120)
    apellido: str = ""
    telefono: str | None = None
    role: str = "ingeniero"

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        role_to_db(value)
        return value


class UsuarioCreate(UsuarioBase):
    password: str = Field(min_length=6, max_length=128)


class UsuarioUpdate(BaseModel):
    email: EmailStr | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    apellido: str | None = None
    telefono: str | None = None
    role: str | None = None
    password: str | None = Field(default=None, min_length=6, max_length=128)

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str | None) -> str | None:
        if value is not None:
            role_to_db(value)
        return value


class UsuarioRead(BaseModel):
    id: str
    email: EmailStr
    nombre: str
    apellido: str
    role: str
    telefono: str | None = None
    createdAt: datetime


def usuario_to_read(usuario) -> UsuarioRead:
    return UsuarioRead(
        id=usuario.id,
        email=usuario.email,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        role=role_to_frontend(usuario.rol),
        telefono=usuario.telefono,
        createdAt=usuario.created_at,
    )
