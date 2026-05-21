from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.alertas.services.alerta_service import AlertaService
from app.modules.bitacora.services.bitacora_service import BitacoraService
from app.modules.equipos.models.equipo import Equipo
from app.modules.equipos.services.maintenance_policy import next_maintenance_date
from app.modules.mantenimientos.models.mantenimiento import Mantenimiento
from app.modules.mantenimientos.schemas.mantenimiento_schema import (
    MantenimientoCreate,
    MantenimientoUpdate,
    mantenimiento_to_read,
)
from app.modules.usuarios.models.usuario import Usuario
from app.shared.enums import EstadoEquipo
from app.shared.exceptions import not_found


class MantenimientoService:
    def __init__(self, db: Session):
        self.db = db
        self.alertas = AlertaService(db)
        self.bitacora = BitacoraService(db)

    def list(self):
        mantenimientos = self.db.scalars(
            select(Mantenimiento).order_by(Mantenimiento.fecha.desc(), Mantenimiento.created_at.desc())
        ).all()
        return [mantenimiento_to_read(mantenimiento) for mantenimiento in mantenimientos]

    def get(self, mantenimiento_id: str) -> Mantenimiento:
        mantenimiento = self.db.get(Mantenimiento, mantenimiento_id)
        if not mantenimiento:
            raise not_found("Mantenimiento")
        return mantenimiento

    def create(self, payload: MantenimientoCreate, user: Usuario):
        equipo = self.db.get(Equipo, payload.equipoId)
        if not equipo:
            raise not_found("Equipo")

        mantenimiento = Mantenimiento(
            equipo_id=payload.equipoId,
            tipo=payload.tipo,
            fecha=payload.fecha,
            tecnico_responsable=payload.tecnicoResponsable,
            descripcion=payload.descripcion,
            observaciones=payload.observaciones,
            repuestos=payload.repuestos or [],
            costo=payload.costo,
            duracion=payload.duracion,
            estado_anterior=payload.estadoAnterior or equipo.estado,
            estado_posterior=payload.estadoPosterior or EstadoEquipo.activo,
            created_by_id=user.id,
            created_by_nombre=f"{user.nombre} {user.apellido}".strip(),
        )
        equipo.ultimo_mantenimiento = payload.fecha
        equipo.proximo_mantenimiento = next_maintenance_date(payload.fecha, equipo.criticidad)
        equipo.estado = mantenimiento.estado_posterior or EstadoEquipo.activo

        self.db.add(mantenimiento)
        self.db.flush()
        self.bitacora.create(
            equipo.id,
            mantenimiento.created_by_nombre,
            f"Mantenimiento {payload.tipo.value}",
            payload.descripcion,
        )
        self.alertas.sync_equipo_alertas(equipo)
        self.db.commit()
        self.db.refresh(mantenimiento)
        return mantenimiento_to_read(mantenimiento)

    def update(self, mantenimiento_id: str, payload: MantenimientoUpdate, user: Usuario):
        mantenimiento = self.get(mantenimiento_id)
        data = payload.model_dump(exclude_unset=True)
        mapping = {
            "equipoId": "equipo_id",
            "tecnicoResponsable": "tecnico_responsable",
            "estadoAnterior": "estado_anterior",
            "estadoPosterior": "estado_posterior",
        }

        for key, value in data.items():
            if value is not None and hasattr(mantenimiento, mapping.get(key, key)):
                setattr(mantenimiento, mapping.get(key, key), value)

        equipo = self.db.get(Equipo, mantenimiento.equipo_id)
        if equipo:
            equipo.ultimo_mantenimiento = mantenimiento.fecha
            equipo.proximo_mantenimiento = next_maintenance_date(mantenimiento.fecha, equipo.criticidad)
            if mantenimiento.estado_posterior:
                equipo.estado = mantenimiento.estado_posterior
            self.alertas.sync_equipo_alertas(equipo)
            self.bitacora.create(
                equipo.id,
                f"{user.nombre} {user.apellido}".strip(),
                f"Actualizacion mantenimiento {mantenimiento.tipo.value}",
                mantenimiento.descripcion,
            )

        self.db.commit()
        self.db.refresh(mantenimiento)
        return mantenimiento_to_read(mantenimiento)

    def delete(self, mantenimiento_id: str):
        mantenimiento = self.get(mantenimiento_id)
        self.db.delete(mantenimiento)
        self.db.commit()
        return {"id": mantenimiento_id}
