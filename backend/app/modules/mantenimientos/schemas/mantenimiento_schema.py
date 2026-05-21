from datetime import date, datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, field_validator

from app.shared.enums import EstadoEquipo, TipoMantenimiento


class MantenimientoBase(BaseModel):
    equipoId: str
    tipo: TipoMantenimiento
    fecha: date
    tecnicoResponsable: str
    descripcion: str
    observaciones: str | None = None
    repuestos: list[str] | str | None = None
    costo: Decimal | None = None
    duracion: Decimal | None = None
    estadoAnterior: EstadoEquipo | None = None
    estadoPosterior: EstadoEquipo | None = None

    @field_validator("repuestos")
    @classmethod
    def normalize_repuestos(cls, value: Any) -> list[str]:
        if value is None or value == "":
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


class MantenimientoCreate(MantenimientoBase):
    pass


class MantenimientoUpdate(BaseModel):
    equipoId: str | None = None
    tipo: TipoMantenimiento | None = None
    fecha: date | None = None
    tecnicoResponsable: str | None = None
    descripcion: str | None = None
    observaciones: str | None = None
    repuestos: list[str] | str | None = None
    costo: Decimal | None = None
    duracion: Decimal | None = None
    estadoAnterior: EstadoEquipo | None = None
    estadoPosterior: EstadoEquipo | None = None

    @field_validator("repuestos")
    @classmethod
    def normalize_repuestos(cls, value: Any) -> list[str] | None:
        if value is None:
            return None
        return MantenimientoBase.normalize_repuestos(value)


class MantenimientoRead(BaseModel):
    id: str
    equipoId: str
    tipo: TipoMantenimiento
    fecha: date
    tecnicoResponsable: str
    descripcion: str
    observaciones: str | None = None
    repuestos: list[str]
    costo: Decimal | None = None
    duracion: Decimal | None = None
    estadoAnterior: EstadoEquipo | None = None
    estadoPosterior: EstadoEquipo | None = None
    createdBy: str
    createdAt: datetime


def mantenimiento_to_read(mantenimiento) -> MantenimientoRead:
    return MantenimientoRead(
        id=mantenimiento.id,
        equipoId=mantenimiento.equipo_id,
        tipo=mantenimiento.tipo,
        fecha=mantenimiento.fecha,
        tecnicoResponsable=mantenimiento.tecnico_responsable,
        descripcion=mantenimiento.descripcion,
        observaciones=mantenimiento.observaciones,
        repuestos=mantenimiento.repuestos or [],
        costo=mantenimiento.costo,
        duracion=mantenimiento.duracion,
        estadoAnterior=mantenimiento.estado_anterior,
        estadoPosterior=mantenimiento.estado_posterior,
        createdBy=mantenimiento.created_by_nombre,
        createdAt=mantenimiento.created_at,
    )
