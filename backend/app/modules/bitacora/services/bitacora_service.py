from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.bitacora.models.bitacora import Bitacora
from app.modules.bitacora.schemas.bitacora_schema import bitacora_to_read


class BitacoraService:
    def __init__(self, db: Session):
        self.db = db

    def list(self):
        entries = self.db.scalars(select(Bitacora).order_by(Bitacora.fecha.desc())).all()
        return [bitacora_to_read(entry) for entry in entries]

    def create(self, equipo_id: str, usuario: str, accion: str, detalles: str) -> Bitacora:
        entry = Bitacora(
            equipo_id=equipo_id,
            usuario=usuario,
            accion=accion,
            detalles=detalles,
            firma_digital=f"BT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        )
        self.db.add(entry)
        return entry
