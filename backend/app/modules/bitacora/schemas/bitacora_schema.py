from datetime import datetime
from pydantic import BaseModel


class BitacoraRead(BaseModel):
    id: str
    equipoId: str
    fecha: datetime
    usuario: str
    accion: str
    detalles: str
    firmaDigital: str | None = None


def bitacora_to_read(bitacora) -> BitacoraRead:
    return BitacoraRead(
        id=bitacora.id,
        equipoId=bitacora.equipo_id,
        fecha=bitacora.fecha,
        usuario=bitacora.usuario,
        accion=bitacora.accion,
        detalles=bitacora.detalles,
        firmaDigital=bitacora.firma_digital,
    )
