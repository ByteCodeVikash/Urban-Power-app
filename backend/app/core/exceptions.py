import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle FastAPI/Starlette HTTPExceptions.
    Logs at warning level for 4xx errors, and error level for 5xx errors.
    """
    if exc.status_code >= 500:
        logger.error(f"HTTP {exc.status_code} Error: {exc.detail} on path {request.url.path}", exc_info=True)
    else:
        logger.warning(f"HTTP {exc.status_code} client error on path {request.url.path}: {exc.detail}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "type": "HTTPException",
                "message": exc.detail,
                "code": exc.status_code,
                "details": None
            },
            "detail": exc.detail
        }
    )

def _clean_errors(errors: list) -> list:
    """
    Ensure all error details are JSON-serializable.
    Pydantic v2 includes raw Exception objects under the 'ctx' key for custom validators.
    """
    serializable_errors = []
    for err in errors:
        if isinstance(err, dict):
            cleaned_err = dict(err)
            if "ctx" in cleaned_err and isinstance(cleaned_err["ctx"], dict):
                cleaned_ctx = {}
                for k, v in cleaned_err["ctx"].items():
                    if isinstance(v, Exception):
                        cleaned_ctx[k] = str(v)
                    else:
                        cleaned_ctx[k] = v
                cleaned_err["ctx"] = cleaned_ctx
            serializable_errors.append(cleaned_err)
        else:
            serializable_errors.append(err)
    return serializable_errors

async def request_validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle FastAPI RequestValidationError (query parameters, path, body).
    Logs validation errors at warning level.
    """
    errors = _clean_errors(exc.errors())
    logger.warning(f"Request validation failed on path {request.url.path}: {errors}")

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "type": "RequestValidationError",
                "message": "Validation failed",
                "code": 422,
                "details": errors
            },
            "detail": errors
        }
    )

async def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle Pydantic ValidationError (internal data parsing / instantiating models).
    Logs validation errors at warning level.
    """
    errors = _clean_errors(exc.errors())
    logger.warning(f"Internal schema validation failed on path {request.url.path}: {errors}")

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "type": "ValidationError",
                "message": "Schema validation failed",
                "code": 422,
                "details": errors
            },
            "detail": errors
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """
    Handle SQLAlchemy database errors.
    Logs database failures at error level.
    """
    logger.error(f"Database error occurred on path {request.url.path}: {exc}", exc_info=True)
    
    message = "Database error occurred. Please try again later."
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "type": "DatabaseError",
                "message": message,
                "code": 500,
                "details": None
            },
            "detail": message
        }
    )

async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all other unhandled/generic exceptions.
    Logs unhandled errors at error level.
    """
    logger.error(f"Unhandled exception occurred on path {request.url.path}: {exc}", exc_info=True)
    
    message = "An unexpected error occurred. Please try again later."
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "type": "InternalServerError",
                "message": message,
                "code": 500,
                "details": None
            },
            "detail": message
        }
    )

def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all centralized exception handlers to the FastAPI app instance.
    """
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, request_validation_exception_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
