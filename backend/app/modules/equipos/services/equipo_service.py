from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.alertas.services.alerta_service import AlertaService
from app.modules.bitacora.services.bitacora_service import BitacoraService
from app.modules.equipos.models.equipo import Equipo
from app.modules.equipos.schemas.equipo_schema import EquipoCreate, EquipoUpdate, equipo_to_read
from app.modules.equipos.services.maintenance_policy import next_maintenance_date
from app.shared.exceptions import not_found


class EquipoService:
    def __init__(self, db: Session):
        self.db = db
        self.alertas = AlertaService(db)
        self.bitacora = BitacoraService(db)

    def list(self):
        self.alertas.sync_all()
        self.db.commit()
        equipos = self.db.scalars(select(Equipo).order_by(Equipo.created_at.desc())).all()
        return [equipo_to_read(equipo) for equipo in equipos]

    def get(self, equipo_id: str) -> Equipo:
        equipo = self.db.get(Equipo, equipo_id)
        if not equipo:
            raise not_found("Equipo")
        return equipo

    def get_read(self, equipo_id: str):
        return equipo_to_read(self.get(equipo_id))

    def create(self, payload: EquipoCreate, actor: str):
        equipo = Equipo(
            nombre=payload.nombre,
            marca=payload.marca,
            modelo=payload.modelo,
            serie=payload.serie,
            fabricante=payload.fabricante,
            pais_origen=payload.paisOrigen,
            ano_fabricacion=payload.anoFabricacion or 0,
            fecha_adquisicion=payload.fechaAdquisicion,
            costo_adquisicion=payload.costoAdquisicion,
            proveedor=payload.proveedor,
            ubicacion=payload.ubicacion,
            area=payload.area,
            responsable=payload.responsable,
            estado=payload.estado,
            criticidad=payload.criticidad,
            especificaciones=payload.normalized_specs(),
            accesorios=payload.accesorios,
            observaciones=payload.observaciones,
            ultimo_mantenimiento=payload.ultimoMantenimiento,
            proximo_mantenimiento=payload.proximoMantenimiento
            or next_maintenance_date(
                payload.ultimoMantenimiento or payload.fechaAdquisicion,
                payload.criticidad,
            ),
        )
        self.db.add(equipo)
        self.db.flush()
        self.bitacora.create(equipo.id, actor, "Registro de equipo", f"Equipo {equipo.nombre} registrado")
        self.alertas.sync_equipo_alertas(equipo)
        self.db.commit()
        self.db.refresh(equipo)
        return equipo_to_read(equipo)

    def update(self, equipo_id: str, payload: EquipoUpdate, actor: str):
        equipo = self.get(equipo_id)
        data = payload.model_dump(exclude_unset=True)
        mapping = {
            "paisOrigen": "pais_origen",
            "anoFabricacion": "ano_fabricacion",
            "fechaAdquisicion": "fecha_adquisicion",
            "costoAdquisicion": "costo_adquisicion",
            "ultimoMantenimiento": "ultimo_mantenimiento",
            "proximoMantenimiento": "proximo_mantenimiento",
        }

        for key, value in data.items():
            if key in {"voltaje", "frecuencia", "potencia", "dimensiones", "peso", "otros"}:
                continue
            if key == "especificaciones" and value is not None:
                equipo.especificaciones = (
                    value.model_dump(exclude_none=True)
                    if hasattr(value, "model_dump")
                    else {k: v for k, v in dict(value).items() if v is not None}
                )
                continue
            if hasattr(equipo, mapping.get(key, key)) and value is not None:
                setattr(equipo, mapping.get(key, key), value)

        if "criticidad" in data and "proximoMantenimiento" not in data:
            base_date = equipo.ultimo_mantenimiento or equipo.fecha_adquisicion
            equipo.proximo_mantenimiento = next_maintenance_date(base_date, equipo.criticidad)

        self.db.flush()
        self.bitacora.create(equipo.id, actor, "Actualizacion de equipo", f"Equipo {equipo.nombre} actualizado")
        self.alertas.sync_equipo_alertas(equipo)
        self.db.commit()
        self.db.refresh(equipo)
        return equipo_to_read(equipo)

    def delete(self, equipo_id: str):
        equipo = self.get(equipo_id)
        self.db.delete(equipo)
        self.db.commit()
        return {"id": equipo_id}
