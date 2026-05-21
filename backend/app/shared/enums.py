from enum import Enum


class RolUsuario(str, Enum):
    GERENCIA = "GERENCIA"
    BIOMEDICO = "BIOMEDICO"


class EstadoEquipo(str, Enum):
    activo = "activo"
    mantenimiento = "mantenimiento"
    inactivo = "inactivo"


class CriticidadEquipo(str, Enum):
    alta = "alta"
    media = "media"
    baja = "baja"


class TipoMantenimiento(str, Enum):
    preventivo = "preventivo"
    correctivo = "correctivo"


class TipoAlerta(str, Enum):
    mantenimiento_vencido = "mantenimiento_vencido"
    mantenimiento_proximo = "mantenimiento_proximo"
    equipo_critico = "equipo_critico"
    equipo_inactivo = "equipo_inactivo"


class PrioridadAlerta(str, Enum):
    alta = "alta"
    media = "media"
    baja = "baja"
