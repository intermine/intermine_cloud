"""User DELETE route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.blocs.user import delete_user
from blackcap.schemas.api.user.delete import UserDelete, UserDELETEResponse
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.routes.user import user_bp


@user_bp.delete("/")
def delete() -> Response:
    """Delete user.

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        user_delete = parse_obj_as(List[UserDelete], (json.loads(request.data)))
    except ValidationError as e:
        response_body = UserDELETEResponse(
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = UserDELETEResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # delete user
    # TODO: Make the api accept an array
    try:
        user = delete_user(user_delete[0])
    except SQLAlchemyError:
        response_body = UserDELETEResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = UserDELETEResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched data in response
    response_body = UserDELETEResponse(msg="user successfully updated", items=user)
    return make_response(response_body.json(), HTTPStatus.OK)
