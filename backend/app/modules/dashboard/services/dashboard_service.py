from datetime import date
from sqlalchemy import extract, func, select
from sqlalchemy.orm import Session

from app.modules.alertas.models.alerta import Alerta
from app.modules.equipos.models.equipo import Equipo
from app.modules.mantenimientos.models.mantenimiento import Mantenimiento
from app.shared.enums import CriticidadEquipo, EstadoEquipo


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def stats(self):
        today = date.today()
        return {
            "totalEquipos": self._count(select(func.count()).select_from(Equipo)),
            "equiposActivos": self._count(select(func.count()).select_from(Equipo).where(Equipo.estado == EstadoEquipo.activo)),
            "equiposMantenimiento": self._count(select(func.count()).select_from(Equipo).where(Equipo.estado == EstadoEquipo.mantenimiento)),
            "equiposInactivos": self._count(select(func.count()).select_from(Equipo).where(Equipo.estado == EstadoEquipo.inactivo)),
            "alertasActivas": self._count(select(func.count()).select_from(Alerta).where(Alerta.leida.is_(False))),
            "equiposCriticos": self._count(select(func.count()).select_from(Equipo).where(Equipo.criticidad == CriticidadEquipo.alta)),
            "mantenimientosMes": self._count(
                select(func.count())
                .select_from(Mantenimiento)
                .where(extract("month", Mantenimiento.fecha) == today.month)
                .where(extract("year", Mantenimiento.fecha) == today.year)
            ),
            "costoMantenimientoMes": self.db.scalar(
                select(func.coalesce(func.sum(Mantenimiento.costo), 0))
                .where(extract("month", Mantenimiento.fecha) == today.month)
                .where(extract("year", Mantenimiento.fecha) == today.year)
            ),
        }

    def _count(self, statement) -> int:
        return int(self.db.scalar(statement) or 0)
