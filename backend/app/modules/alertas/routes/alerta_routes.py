from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.modules.alertas.services.alerta_service import AlertaService
from app.shared.responses import success_response


router = APIRouter(prefix="/alertas", tags=["Alertas"])


@router.get("")
def list_alertas(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(AlertaService(db).list())


@router.put("")
def mark_all_read(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(AlertaService(db).mark_all_read())


@router.put("/{alerta_id}")
def mark_read(alerta_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(AlertaService(db).mark_read(alerta_id))
