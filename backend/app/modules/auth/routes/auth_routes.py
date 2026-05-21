from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.schemas.auth_schema import (
    LoginRequest,
    RecoverPasswordRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyTwoFactorRequest,
)
from app.modules.auth.services.auth_service import AuthService
from app.shared.responses import success_response


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    return success_response(AuthService(db).register(payload))


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return success_response(AuthService(db).login(payload))


@router.post("/verify-2fa")
def verify_two_factor(payload: VerifyTwoFactorRequest, db: Session = Depends(get_db)):
    return success_response(AuthService(db).verify_two_factor(payload))


@router.post("/recover")
def recover(payload: RecoverPasswordRequest, db: Session = Depends(get_db)):
    return success_response(AuthService(db).recover(str(payload.email)))


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    return success_response(AuthService(db).reset_password(payload))
