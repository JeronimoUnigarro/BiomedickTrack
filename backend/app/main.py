import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.modules.alertas.services.maintenance_scheduler import maintenance_alert_scheduler
from app.modules.alertas.routes.alerta_routes import router as alertas_router
from app.modules.auth.routes.auth_routes import router as auth_router
from app.modules.bitacora.routes.bitacora_routes import router as bitacora_router
from app.modules.dashboard.routes.dashboard_routes import router as dashboard_router
from app.modules.equipos.routes.equipo_routes import router as equipos_router
from app.modules.mantenimientos.routes.mantenimiento_routes import router as mantenimientos_router
from app.modules.usuarios.routes.usuario_routes import router as usuarios_router
from app.shared.exceptions import (
    app_exception_handler,
    integrity_exception_handler,
    validation_exception_handler,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        debug=settings.debug,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(HTTPException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_exception_handler)

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(usuarios_router, prefix=settings.api_prefix)
    app.include_router(equipos_router, prefix=settings.api_prefix)
    app.include_router(mantenimientos_router, prefix=settings.api_prefix)
    app.include_router(alertas_router, prefix=settings.api_prefix)
    app.include_router(bitacora_router, prefix=settings.api_prefix)
    app.include_router(dashboard_router, prefix=settings.api_prefix)

    @app.get("/health", tags=["Health"])
    def health():
        return {"success": True, "status": "ok"}

    @app.on_event("startup")
    async def start_maintenance_scheduler():
        asyncio.create_task(maintenance_alert_scheduler())

    return app


app = create_app()
