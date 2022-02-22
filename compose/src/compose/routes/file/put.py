"""User PUT route."""

from http import HTTPStatus
import json

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.file import update_file
from compose.routes.file import file_bp
from compose.schemas.api.file.put import FilePUTRequest, FilePUTResponse
from compose.utils.auth import check_authentication


@file_bp.put("/")
@check_authentication
def put(user: User) -> Response:
    """Update user.

    Args:
        user (User): extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        file_update = parse_obj_as(FilePUTRequest, (json.loads(request.data)))
    except ValidationError as e:
        response_body = FilePUTResponse(
            msg="json validation failed", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = FilePUTResponse(
            msg="Something bad happened. Please try again after some time.",
            errors={"main": ["unknown internal error"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Update file
    # TODO: Make the api accepts array
    try:
        updated_file_list = update_file(file_update.file_list)
    except SQLAlchemyError:
        response_body = FilePUTResponse(
            msg="Something bad happened. Please try again after some time",
            errors={"main": ["unknown internal error"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = FilePUTResponse(
            msg="Something bad happened. Please try again after some time.",
            errors={"main": ["unknown internal error"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched file in response
    response_body = FilePUTResponse(
        msg="File updated successfully", items={"file_list": updated_file_list}
    )
    return make_response(response_body.json(), HTTPStatus.OK)
