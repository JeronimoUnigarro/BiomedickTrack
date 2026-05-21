from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.schemas.usuario_schema import (
    UsuarioCreate,
    UsuarioUpdate,
    role_to_db,
    usuario_to_read,
)
from app.shared.enums import RolUsuario
from app.shared.exceptions import not_found


class UsuarioService:
    def __init__(self, db: Session):
        self.db = db

    def list(self):
        usuarios = self.db.scalars(select(Usuario).order_by(Usuario.created_at.desc())).all()
        return [usuario_to_read(usuario) for usuario in usuarios]

    def get_by_email(self, email: str) -> Usuario | None:
        return self.db.scalar(select(Usuario).where(Usuario.email == email.lower()))

    def get(self, user_id: str) -> Usuario:
        usuario = self.db.get(Usuario, user_id)
        if not usuario:
            raise not_found("Usuario")
        return usuario

    def create(self, payload: UsuarioCreate, forced_role: RolUsuario | None = None):
        if self.get_by_email(str(payload.email)):
            raise HTTPException(status.HTTP_409_CONFLICT, "El correo ya esta registrado")

        usuario = Usuario(
            email=str(payload.email).lower(),
            nombre=payload.nombre,
            apellido=payload.apellido or "",
            telefono=payload.telefono,
            rol=forced_role or role_to_db(payload.role),
            password_hash=hash_password(payload.password),
        )
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario_to_read(usuario)

    def update(self, user_id: str, payload: UsuarioUpdate):
        usuario = self.get(user_id)
        data = payload.model_dump(exclude_unset=True)

        if "email" in data and data["email"]:
            existing = self.get_by_email(str(data["email"]))
            if existing and existing.id != user_id:
                raise HTTPException(status.HTTP_409_CONFLICT, "El correo ya esta registrado")
            usuario.email = str(data["email"]).lower()
        if "nombre" in data and data["nombre"] is not None:
            usuario.nombre = data["nombre"]
        if "apellido" in data and data["apellido"] is not None:
            usuario.apellido = data["apellido"]
        if "telefono" in data:
            usuario.telefono = data["telefono"]
        if "role" in data and data["role"] is not None:
            usuario.rol = role_to_db(data["role"])
        if "password" in data and data["password"]:
            usuario.password_hash = hash_password(data["password"])

        self.db.commit()
        self.db.refresh(usuario)
        return usuario_to_read(usuario)

    def delete(self, user_id: str):
        usuario = self.get(user_id)
        self.db.delete(usuario)
        self.db.commit()
        return {"id": user_id}
