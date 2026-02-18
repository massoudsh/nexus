"""
Global exception handlers and request validation for consistent API error responses.
"""
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def get_error_detail(err: RequestValidationError) -> list:
    """Turn FastAPI/Pydantic validation errors into a readable list."""
    details = []
    for e in err.errors():
        loc = ".".join(str(x) for x in e["loc"] if x != "body")
        msg = e.get("msg", "Validation error")
        details.append({"field": loc or "body", "message": msg})
    return details


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTPException with consistent JSON body and logging."""
    logger.warning("HTTP %s on %s %s: %s", exc.status_code, request.method, request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if isinstance(exc.detail, str) else exc.detail},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle 422 validation errors with user-friendly messages and logging."""
    details = get_error_detail(exc)
    logger.info("Validation error on %s %s: %s", request.method, request.url.path, details)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed",
            "errors": details,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions; log and return 500 without leaking internals."""
    logger.exception("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )
