"""Auth PUT route."""

from http import HTTPStatus
import json

from flask import make_response, request, Response
from logzero import logger
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.auther import auther_registry
from compose.configs import config_registry
from compose.routes.auth import auth_bp
from compose.schemas.api.auth.put import AuthPUTRequest, AuthPUTResponse


config = config_registry.get_config()
auther = auther_registry.get_auther(config.AUTHER)


@auth_bp.post("/")
def put() -> Response:
    """Creds reset.

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        user_creds_reset = AuthPUTRequest.parse_obj(json.loads(request.data))
    except ValidationError as e:
        response_body = AuthPUTResponse(msg="json validation failed", errors=e.errors())
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception as e:
        response_body = AuthPUTResponse(
            msg="unknown error", errors=[f"unknown internal error: {e}"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # if no password reset token, then send reset email and return
    try:
        pass
    except Exception as e:
        logger.error(f"Sending password reset email failed due to: {e}")

    # try to reset user creds
    try:
        pass
    except SQLAlchemyError:
        response_body = AuthPUTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = AuthPUTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    user = "" + user_creds_reset
    # return logged in user and cookie in response
    response_body = AuthPUTResponse(
        msg="User creds updated successfully", items=[user.dict()]
    )
    return make_response(response_body.json(), HTTPStatus.OK)
