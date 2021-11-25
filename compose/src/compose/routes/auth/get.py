"""Auth GET route."""

from http import HTTPStatus

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from flask import make_response, Response

from compose.routes.auth import auth_bp
from compose.utils.auth import check_authentication


@auth_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get data.

    Args:
        user (User): user extracted from token.

    Returns:
        Response: Flask response
    """
    # return fetched data in response
    response_body = ResponseSchema(
        msg="You are authenticated", items=[user]
    )  # noqa: E501
    return make_response(response_body.json(), HTTPStatus.OK)
