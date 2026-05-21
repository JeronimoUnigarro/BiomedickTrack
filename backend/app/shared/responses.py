from typing import Any


def success_response(data: Any = None, message: str | None = None) -> dict[str, Any]:
    response: dict[str, Any] = {"success": True}
    if data is not None:
        response["data"] = data
    if message:
        response["message"] = message
    return response
