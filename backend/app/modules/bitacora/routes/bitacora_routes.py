from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.modules.bitacora.services.bitacora_service import BitacoraService
from app.shared.responses import success_response


router = APIRouter(prefix="/bitacora", tags=["Bitacora"])


@router.get("")
def list_bitacora(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(BitacoraService(db).list())
