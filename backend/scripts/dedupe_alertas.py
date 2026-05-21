from pathlib import Path
import re
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.database import SessionLocal
from app.shared import models  # noqa: F401
from app.modules.alertas.models.alerta import Alerta


DATE_PATTERN = re.compile(r"\((\d{4}-\d{2}-\d{2})\)")


def alert_key(alerta: Alerta) -> tuple[str, str, str]:
    match = DATE_PATTERN.search(alerta.mensaje or "")
    maintenance_date = match.group(1) if match else ""
    return alerta.equipo_id, alerta.tipo.value, maintenance_date


def run() -> None:
    db = SessionLocal()
    try:
        alertas = db.scalars(select(Alerta).order_by(Alerta.fecha.desc())).all()
        seen: set[tuple[str, str, str]] = set()
        deleted = 0

        for alerta in alertas:
            key = alert_key(alerta)
            if key in seen:
                db.delete(alerta)
                deleted += 1
            else:
                seen.add(key)

        db.commit()
        print(f"Alertas duplicadas eliminadas: {deleted}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
