from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator

from app.shared.enums import CriticidadEquipo, EstadoEquipo


class EspecificacionesEquipo(BaseModel):
    voltaje: str | None = None
    frecuencia: str | None = None
    potencia: str | None = None
    dimensiones: str | None = None
    peso: str | None = None
    otros: str | None = None


class EquipoBase(BaseModel):
    nombre: str
    marca: str
    modelo: str
    serie: str
    fabricante: str
    paisOrigen: str
    anoFabricacion: int | None = None
    fechaAdquisicion: date
    costoAdquisicion: Decimal = Decimal("0")
    proveedor: str
    ubicacion: str
    area: str
    responsable: str
    estado: EstadoEquipo = EstadoEquipo.activo
    criticidad: CriticidadEquipo = CriticidadEquipo.media
    especificaciones: EspecificacionesEquipo | None = None
    accesorios: list[str] = Field(default_factory=list)
    observaciones: str | None = None
    ultimoMantenimiento: date | None = None
    proximoMantenimiento: date | None = None
    voltaje: str | None = None
    frecuencia: str | None = None
    potencia: str | None = None
    dimensiones: str | None = None
    peso: str | None = None
    otros: str | None = None

    @model_validator(mode="before")
    @classmethod
    def accept_frontend_year_and_flat_specs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "añoFabricacion" in data and "anoFabricacion" not in data:
                data["anoFabricacion"] = data["añoFabricacion"]
            if "aÃ±oFabricacion" in data and "anoFabricacion" not in data:
                data["anoFabricacion"] = data["aÃ±oFabricacion"]
            specs = dict(data.get("especificaciones") or {})
            for key in ("voltaje", "frecuencia", "potencia", "dimensiones", "peso", "otros"):
                if data.get(key) not in (None, ""):
                    specs[key] = data.get(key)
            if specs:
                data["especificaciones"] = specs
        return data

    @field_validator("anoFabricacion")
    @classmethod
    def validate_year(cls, value: int | None) -> int:
        if value is None:
            return datetime.utcnow().year
        if value < 1900 or value > datetime.utcnow().year + 1:
            raise ValueError("Ano de fabricacion invalido")
        return value

    def normalized_specs(self) -> dict:
        return (self.especificaciones or EspecificacionesEquipo()).model_dump(exclude_none=True)


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    nombre: str | None = None
    marca: str | None = None
    modelo: str | None = None
    serie: str | None = None
    fabricante: str | None = None
    paisOrigen: str | None = None
    anoFabricacion: int | None = None
    fechaAdquisicion: date | None = None
    costoAdquisicion: Decimal | None = None
    proveedor: str | None = None
    ubicacion: str | None = None
    area: str | None = None
    responsable: str | None = None
    estado: EstadoEquipo | None = None
    criticidad: CriticidadEquipo | None = None
    especificaciones: EspecificacionesEquipo | None = None
    accesorios: list[str] | None = None
    observaciones: str | None = None
    ultimoMantenimiento: date | None = None
    proximoMantenimiento: date | None = None
    voltaje: str | None = None
    frecuencia: str | None = None
    potencia: str | None = None
    dimensiones: str | None = None
    peso: str | None = None
    otros: str | None = None

    @model_validator(mode="before")
    @classmethod
    def accept_frontend_fields(cls, data: Any) -> Any:
        return EquipoBase.accept_frontend_year_and_flat_specs(data)


class EquipoRead(BaseModel):
    id: str
    nombre: str
    marca: str
    modelo: str
    serie: str
    fabricante: str
    paisOrigen: str
    anoFabricacion: int
    fechaAdquisicion: date
    costoAdquisicion: Decimal
    proveedor: str
    ubicacion: str
    area: str
    responsable: str
    estado: EstadoEquipo
    criticidad: CriticidadEquipo
    especificaciones: dict
    accesorios: list[str]
    observaciones: str | None = None
    ultimoMantenimiento: date | None = None
    proximoMantenimiento: date | None = None
    createdAt: datetime


def default_next_maintenance(value: date | None = None) -> date:
    return (value or date.today()) + timedelta(days=90)


def equipo_to_read(equipo) -> EquipoRead:
    return EquipoRead(
        id=equipo.id,
        nombre=equipo.nombre,
        marca=equipo.marca,
        modelo=equipo.modelo,
        serie=equipo.serie,
        fabricante=equipo.fabricante,
        paisOrigen=equipo.pais_origen,
        anoFabricacion=equipo.ano_fabricacion,
        fechaAdquisicion=equipo.fecha_adquisicion,
        costoAdquisicion=equipo.costo_adquisicion,
        proveedor=equipo.proveedor,
        ubicacion=equipo.ubicacion,
        area=equipo.area,
        responsable=equipo.responsable,
        estado=equipo.estado,
        criticidad=equipo.criticidad,
        especificaciones=equipo.especificaciones or {},
        accesorios=equipo.accesorios or [],
        observaciones=equipo.observaciones,
        ultimoMantenimiento=equipo.ultimo_mantenimiento,
        proximoMantenimiento=equipo.proximo_mantenimiento,
        createdAt=equipo.created_at,
    )
