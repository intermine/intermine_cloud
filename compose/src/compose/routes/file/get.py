"""File GET route."""

from http import HTTPStatus

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.file import get_file
from compose.routes.file import file_bp
from compose.schemas.api.file.get import FileGetQueryParams, FileGetResponse
from compose.utils.auth import check_authentication


@file_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get file.

    Args:
        user (User): Extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = FileGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = FileGetResponse(msg="query validation error", errors=e.errors())
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = FileGetResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Get file from the DB
    try:
        file_list = get_file(query_params, user)
    except SQLAlchemyError:
        response_body = FileGetResponse(
            msg="Something bad happened. Please try again after some time", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = FileGetResponse(
            msg="Something bad happened. Please try again after some time", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched file in response
    response_body = FileGetResponse(msg="Files retrieved successfully", items=file_list)
    return make_response(response_body.json(), HTTPStatus.OK)
