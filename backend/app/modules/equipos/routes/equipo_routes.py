from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user, require_roles
from app.modules.equipos.schemas.equipo_schema import EquipoCreate, EquipoUpdate
from app.modules.equipos.services.equipo_service import EquipoService
from app.modules.usuarios.models.usuario import Usuario
from app.shared.enums import RolUsuario
from app.shared.responses import success_response


router = APIRouter(prefix="/equipos", tags=["Equipos"])


@router.get("")
def list_equipos(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(EquipoService(db).list())


@router.get("/{equipo_id}")
def get_equipo(equipo_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return success_response(EquipoService(db).get_read(equipo_id))


@router.post("")
def create_equipo(
    payload: EquipoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    actor = f"{current_user.nombre} {current_user.apellido}".strip()
    return success_response(EquipoService(db).create(payload, actor))


@router.put("/{equipo_id}")
def update_equipo(
    equipo_id: str,
    payload: EquipoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    actor = f"{current_user.nombre} {current_user.apellido}".strip()
    return success_response(EquipoService(db).update(equipo_id, payload, actor))


@router.delete("/{equipo_id}")
def delete_equipo(
    equipo_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.BIOMEDICO)),
):
    return success_response(EquipoService(db).delete(equipo_id))
