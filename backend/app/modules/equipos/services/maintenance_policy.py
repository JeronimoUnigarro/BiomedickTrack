from calendar import monthrange
from datetime import date

from app.shared.enums import CriticidadEquipo


def maintenance_interval_months(criticidad: CriticidadEquipo) -> int:
    intervals = {
        CriticidadEquipo.alta: 2,
        CriticidadEquipo.media: 3,
        CriticidadEquipo.baja: 6,
    }
    return intervals[criticidad]


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, monthrange(year, month)[1])
    return date(year, month, day)


def next_maintenance_date(base_date: date, criticidad: CriticidadEquipo) -> date:
    return add_months(base_date, maintenance_interval_months(criticidad))
