from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles
from app.modules.mantenimientos.schemas.mantenimiento_schema import MantenimientoCreate, MantenimientoUpdate
from app.modules.mantenimientos.services.mantenimiento_service import MantenimientoService
from app.modules.usuarios.models.usuario import Usuario
from app.shared.enums import RolUsuario
from app.shared.responses import success_response


router = APIRouter(prefix="/mantenimientos", tags=["Mantenimientos"])


@router.get("")
def list_mantenimientos(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(MantenimientoService(db).list())


@router.post("")
def create_mantenimiento(
    payload: MantenimientoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    return success_response(MantenimientoService(db).create(payload, current_user))


@router.put("/{mantenimiento_id}")
def update_mantenimiento(
    mantenimiento_id: str,
    payload: MantenimientoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    return success_response(MantenimientoService(db).update(mantenimiento_id, payload, current_user))


@router.delete("/{mantenimiento_id}")
def delete_mantenimiento(
    mantenimiento_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    return success_response(MantenimientoService(db).delete(mantenimiento_id))
