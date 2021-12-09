"""User PUT route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.file import update_file
from compose.routes.file import file_bp
from compose.schemas.api.file.put import FilePUTResponse, FileUpdate
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
        file_update = parse_obj_as(List[FileUpdate], (json.loads(request.data)))
    except ValidationError as e:
        response_body = FilePUTResponse(msg="json validation failed", errors=e.errors())
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = FilePUTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Update file
    # TODO: Make the api accepts array
    try:
        file = update_file(file_update[0])
    except SQLAlchemyError:
        response_body = FilePUTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = FilePUTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched file in response
    response_body = FilePUTResponse(msg="user successfully updated", items=[file])
    return make_response(response_body.json(), HTTPStatus.OK)
