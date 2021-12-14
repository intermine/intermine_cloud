"""Auth POST route."""

from http import HTTPStatus
import json

from blackcap.schemas.api.auth.post import AuthUserCreds
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
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception as e:
        response_body = AuthPOSTResponse(
            msg="unknown error", errors=[f"unknown internal error: {e}"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # try to login user
    try:
        user, token = auther.login_user(AuthUserCreds(**user_creds.dict()))
    except SQLAlchemyError:
        response_body = AuthPOSTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = AuthPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    if user is None:
        # return invalid creds in response
        response_body = AuthPOSTResponse(
            msg="Invalid credentials", items=[], errors=["Invalid credentials"]
        )
        response = make_response(response_body.json(), HTTPStatus.OK)
        return response

    # return logged in user and cookie in response
    response_body = AuthPOSTResponse(
        msg="User successfully logged in", items=[user.dict()]
    )
    response = make_response(response_body.json(), HTTPStatus.OK)
    response.set_cookie("imcloud", f"Bearer {token}")
    return response
