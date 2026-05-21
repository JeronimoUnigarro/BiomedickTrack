from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


def not_found(entity: str = "Recurso") -> AppException:
    return AppException(status.HTTP_404_NOT_FOUND, f"{entity} no encontrado")


def forbidden(message: str = "No tienes permisos para esta accion") -> AppException:
    return AppException(status.HTTP_403_FORBIDDEN, message)


async def app_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": str(exc.detail)},
    )


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    # Convertir bytes a string para que sea serializable a JSON
    for error in errors:
        if isinstance(error.get("input"), bytes):
            error["input"] = error["input"].decode("utf-8")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "error": "Datos invalidos", "details": errors},
    )


async def integrity_exception_handler(_: Request, __: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"success": False, "error": "El registro ya existe o viola una restriccion"},
    )
