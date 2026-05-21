from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_roles
from app.modules.usuarios.schemas.usuario_schema import UsuarioCreate, UsuarioUpdate
from app.modules.usuarios.services.usuario_service import UsuarioService
from app.shared.enums import RolUsuario
from app.shared.responses import success_response


router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("")
def list_usuarios(
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.GERENCIA)),
):
    return success_response(UsuarioService(db).list())


@router.post("")
def create_usuario(
    payload: UsuarioCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.GERENCIA)),
):
    return success_response(UsuarioService(db).create(payload))


@router.put("/{usuario_id}")
def update_usuario(
    usuario_id: str,
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.GERENCIA)),
):
    return success_response(UsuarioService(db).update(usuario_id, payload))


@router.delete("/{usuario_id}")
def delete_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_roles(RolUsuario.GERENCIA)),
):
    return success_response(UsuarioService(db).delete(usuario_id))
