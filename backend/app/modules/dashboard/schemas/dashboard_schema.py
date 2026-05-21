from decimal import Decimal
from pydantic import BaseModel


class DashboardStatsRead(BaseModel):
    totalEquipos: int
    equiposActivos: int
    equiposMantenimiento: int
    equiposInactivos: int
    alertasActivas: int
    equiposCriticos: int
    mantenimientosMes: int
    costoMantenimientoMes: Decimal
