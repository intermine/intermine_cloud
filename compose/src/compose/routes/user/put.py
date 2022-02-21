"""User PUT route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.blocs.user import update_user
from blackcap.schemas.api.user.put import UserUpdate, UserPUTResponse
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.routes.user import user_bp


@user_bp.put("/")
def put() -> Response:
    """Update user.

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        user_update = parse_obj_as(List[UserUpdate], (json.loads(request.data)))
    except ValidationError as e:
        response_body = UserPUTResponse(
            msg="json validation failed", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = UserPUTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Update user
    # TODO: Make the api accepts array
    try:
        user = update_user(user_update[0])
    except SQLAlchemyError:
        response_body = UserPUTResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = UserPUTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched data in response
    response_body = UserPUTResponse(
        msg="user successfully updated", items={"user_list": [user]}
    )
    return make_response(response_body.json(), HTTPStatus.OK)
