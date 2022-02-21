"""Auth DELETE route."""

from http import HTTPStatus

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from flask import make_response, Response

from compose.auther import auther_registry
from compose.configs import config_registry
from compose.routes.auth import auth_bp
from compose.utils.auth import check_authentication


config = config_registry.get_config()
auther = auther_registry.get_auther(config.AUTHER)


@auth_bp.delete("/")
@check_authentication
def delete(user: User) -> Response:
    """Logout.

    Args:
        user (User): Extracted user from token

    Returns:
        Response: Flask response
    """
    # return logged in user and cookie in response
    response_body = ResponseSchema(
        msg="User successfully logged out", items={"user_list": [user.dict()]}
    )
    response = make_response(response_body.json(), HTTPStatus.OK)
    response.delete_cookie("imcloud")
    return response
