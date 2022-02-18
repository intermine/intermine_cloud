"""Mine GET route."""

from http import HTTPStatus

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.mine import get_mine
from compose.routes.mine import mine_bp
from compose.schemas.api.mine.get import MineGetQueryParams, MineGetResponse
from compose.utils.auth import check_authentication


@mine_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get mine.

    Args:
        user (User): user extracted from token.

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = MineGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = MineGetResponse(
            msg="query validation error", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = MineGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Get mines from the DB
    try:
        mine_list = get_mine(query_params, user)
    except SQLAlchemyError:
        response_body = MineGetResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except ValidationError as e:
        response_body = MineGetResponse(msg="query validation error", errors=e.errors())
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = MineGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched mines in response
    response_body = MineGetResponse(msg="data successfully retrieved", items=mine_list)
    return make_response(response_body.json(), HTTPStatus.OK)
