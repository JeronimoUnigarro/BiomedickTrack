from pydantic import BaseModel, EmailStr, Field

from app.modules.usuarios.schemas.usuario_schema import UsuarioCreate, UsuarioRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginChallenge(BaseModel):
    requires2FA: bool = True
    email: EmailStr
    message: str


class VerifyTwoFactorRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class AuthSession(BaseModel):
    token: str
    user: UsuarioRead


class RecoverPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=20)
    password: str = Field(min_length=6, max_length=128)


RegisterRequest = UsuarioCreate
