from datetime import datetime
from pydantic import BaseModel

from app.shared.enums import PrioridadAlerta, TipoAlerta


class AlertaRead(BaseModel):
    id: str
    equipoId: str
    equipoNombre: str
    tipo: TipoAlerta
    mensaje: str
    prioridad: PrioridadAlerta
    fecha: datetime
    leida: bool


def alerta_to_read(alerta) -> AlertaRead:
    return AlertaRead(
        id=alerta.id,
        equipoId=alerta.equipo_id,
        equipoNombre=alerta.equipo.nombre if alerta.equipo else "Equipo no encontrado",
        tipo=alerta.tipo,
        mensaje=alerta.mensaje,
        prioridad=alerta.prioridad,
        fecha=alerta.fecha,
        leida=alerta.leida,
    )
