import asyncio

from app.core.database import SessionLocal
from app.modules.alertas.services.alerta_service import AlertaService


async def maintenance_alert_scheduler() -> None:
    while True:
        db = SessionLocal()
        try:
            AlertaService(db).sync_all()
            db.commit()
        except Exception as exc:
            db.rollback()
            print(f"[BiomedicTrack] Error sincronizando alertas de mantenimiento: {exc}")
        finally:
            db.close()

        await asyncio.sleep(60 * 60 * 24)
