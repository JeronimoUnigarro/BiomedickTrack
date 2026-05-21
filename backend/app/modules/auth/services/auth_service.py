from datetime import datetime, timedelta
import secrets
from urllib.parse import quote
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.email import EmailService
from app.core.security import create_access_token, hash_password, hash_token, verify_password, verify_token
from app.modules.auth.schemas.auth_schema import (
    LoginChallenge,
    LoginRequest,
    ResetPasswordRequest,
    VerifyTwoFactorRequest,
)
from app.modules.usuarios.models.usuario import Usuario
from app.modules.usuarios.schemas.usuario_schema import UsuarioCreate, usuario_to_read
from app.modules.usuarios.services.usuario_service import UsuarioService
from app.shared.enums import RolUsuario


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.usuarios = UsuarioService(db)

    def register(self, payload: UsuarioCreate):
        return self.usuarios.create(payload, forced_role=RolUsuario.GERENCIA)

    def login(self, payload: LoginRequest) -> LoginChallenge:
        usuario = self.usuarios.get_by_email(str(payload.email))
        if not usuario or not verify_password(payload.password, usuario.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales incorrectas")

        code = settings.dev_2fa_code or f"{secrets.randbelow(1_000_000):06d}"
        usuario.two_factor_code_hash = hash_password(code)
        usuario.two_factor_expires_at = datetime.utcnow() + timedelta(
            minutes=settings.two_factor_expire_minutes
        )
        self.db.commit()

        try:
            EmailService().send_two_factor_code(
                usuario.email,
                code,
                settings.two_factor_expire_minutes,
            )
        except Exception as exc:
            usuario.two_factor_code_hash = None
            usuario.two_factor_expires_at = None
            self.db.commit()
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "No se pudo enviar el codigo de verificacion por correo",
            ) from exc

        return LoginChallenge(
            email=usuario.email,
            message="Codigo de verificacion enviado al correo registrado",
        )

    def verify_two_factor(self, payload: VerifyTwoFactorRequest):
        usuario = self.usuarios.get_by_email(str(payload.email))
        if not usuario or not usuario.two_factor_code_hash or not usuario.two_factor_expires_at:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Codigo incorrecto o expirado")
        if usuario.two_factor_expires_at < datetime.utcnow():
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Codigo incorrecto o expirado")
        if not verify_password(payload.code, usuario.two_factor_code_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Codigo incorrecto o expirado")

        usuario.two_factor_code_hash = None
        usuario.two_factor_expires_at = None
        self.db.commit()

        token = create_access_token(
            usuario.id,
            {"email": usuario.email, "role": usuario.rol.value},
        )
        return {"token": token, "user": usuario_to_read(usuario)}

    def recover(self, email: str):
        usuario = self.usuarios.get_by_email(email)
        if usuario:
            token = secrets.token_urlsafe(48)
            usuario.password_reset_token_hash = hash_token(token)
            usuario.password_reset_expires_at = datetime.utcnow() + timedelta(
                minutes=settings.recovery_token_ttl_minutes
            )
            self.db.commit()

            reset_url = (
                f"{settings.frontend_url.rstrip('/')}/recuperar-contrasena"
                f"?token={quote(token)}&email={quote(usuario.email)}"
            )

            try:
                EmailService().send_password_recovery(
                    usuario.email,
                    reset_url,
                    settings.recovery_token_ttl_minutes,
                )
            except Exception as exc:
                usuario.password_reset_token_hash = None
                usuario.password_reset_expires_at = None
                self.db.commit()
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "No se pudo enviar el correo de recuperacion",
                ) from exc

        return {"email": email, "message": "Si el correo existe, recibira instrucciones"}

    def reset_password(self, payload: ResetPasswordRequest):
        token_hash = hash_token(payload.token)
        usuario = self.db.scalar(
            select(Usuario).where(Usuario.password_reset_token_hash == token_hash)
        )

        if not usuario or not usuario.password_reset_expires_at:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token invalido o expirado")
        if usuario.password_reset_expires_at < datetime.utcnow():
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token invalido o expirado")
        if not verify_token(payload.token, usuario.password_reset_token_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token invalido o expirado")

        usuario.password_hash = hash_password(payload.password)
        usuario.password_reset_token_hash = None
        usuario.password_reset_expires_at = None
        usuario.two_factor_code_hash = None
        usuario.two_factor_expires_at = None
        self.db.commit()

        return {"message": "Contrasena actualizada correctamente"}
