"""User GET route."""

from http import HTTPStatus

from blackcap.blocs.user import get_users
from blackcap.schemas.api.user.get import UserGetQueryParams, UserGetResponse
from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.routes.user import user_bp
from compose.utils.auth import check_authentication


@user_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get user.

    Args:
        user (User): Extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = UserGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = UserGetResponse(
            msg="query validation error", errors={"main": e.errors()}
        )  # noqa: E501
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = UserGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501

    # Get users from the DB
    try:
        user_list = get_users(query_params)
    except SQLAlchemyError:
        response_body = UserGetResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501
    except Exception:
        response_body = UserGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501

    # return fetched users in response
    response_body = UserGetResponse(
        msg=" successfully retrieved", items={"user_list": user_list}
    )  # noqa: E501
    return make_response(response_body.json(), HTTPStatus.OK)
