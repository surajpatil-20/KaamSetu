from django.db import OperationalError, DatabaseError

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

import logging


logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)

    # -----------------------------------------
    # DATABASE OPERATIONAL ERROR
    # -----------------------------------------

    if isinstance(exc, OperationalError):

        logger.exception(
            "Database operational error",
            exc_info=exc
        )

        return Response(
            {
                "error": "Database temporarily unavailable.",
                "code": "DATABASE_UNAVAILABLE"
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # -----------------------------------------
    # OTHER DATABASE ERRORS
    # -----------------------------------------

    if isinstance(exc, DatabaseError):

        logger.exception(
            "Database error",
            exc_info=exc
        )

        return Response(
            {
                "error": "A database error occurred.",
                "code": "DATABASE_ERROR"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # -----------------------------------------
    # DRF HANDLED ERRORS
    # -----------------------------------------

    if response is not None:

        error_message = extract_error_message(
            response.data
        )

        return Response(
            {
                "error": error_message,
                "code": get_error_code(
                    response.status_code
                )
            },
            status=response.status_code,
            headers=response.headers
        )

    # -----------------------------------------
    # UNEXPECTED ERRORS
    # -----------------------------------------

    logger.exception(
        "Unhandled exception",
        exc_info=exc
    )

    return Response(
        {
            "error": "An unexpected server error occurred.",
            "code": "INTERNAL_SERVER_ERROR"
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def extract_error_message(data):

    if isinstance(data, dict):

        # Standard DRF errors such as 404/401/403
        if "detail" in data:
            return data["detail"]

        # Serializer validation errors
        return data

    if isinstance(data, list):
        return data

    return str(data)


def get_error_code(status_code):

    error_codes = {
        400: "VALIDATION_ERROR",
        401: "AUTHENTICATION_ERROR",
        403: "PERMISSION_DENIED",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        429: "TOO_MANY_REQUESTS",
    }

    return error_codes.get(
        status_code,
        "API_ERROR"
    )