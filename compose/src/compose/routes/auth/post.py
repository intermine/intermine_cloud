"""Auth POST route."""

from http import HTTPStatus
import json

from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.auther import auther_registry
from compose.configs import config_registry
from compose.routes.auth import auth_bp
from compose.schemas.api.auth.post import AuthPOSTRequest, AuthPOSTResponse


config = config_registry.get_config()
auther = auther_registry.get_auther(config.AUTHER)


@auth_bp.post("/")
def post() -> Response:
    """Login.

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        user_creds = AuthPOSTRequest.parse_obj(json.loads(request.data))
    except ValidationError as e:
        response_body = AuthPOSTResponse(
            msg="json validation failed", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception as e:
        response_body = AuthPOSTResponse(
            msg="There is some problem with our server.",
            errors={"main": [f"unknown internal error: {e}"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # try to login user
    try:
        user, token = auther.login_user(AuthPOSTRequest(**user_creds.dict()))
    except SQLAlchemyError:
        response_body = AuthPOSTResponse(
            msg="Something bad happened. Please come back after some time.",
            errors={"main": ["internal database error"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = AuthPOSTResponse(
            msg="Something bad happened. Please come back after some time.",
            errors={"main": ["unknown internal error"]},
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    if user is None:
        # return invalid creds in response
        response_body = AuthPOSTResponse(
            msg="Wrong credentials.", items=[], errors={"main": ["Wrong credentials"]}
        )
        response = make_response(response_body.json(), HTTPStatus.UNAUTHORIZED)
        return response

    # return logged in user and cookie in response
    response_body = AuthPOSTResponse(
        msg="User successfully logged in", items={"user_list": [user.dict()]}
    )
    response = make_response(response_body.json(), HTTPStatus.OK)
    response.set_cookie("imcloud", f"Bearer {token}")
    return response
