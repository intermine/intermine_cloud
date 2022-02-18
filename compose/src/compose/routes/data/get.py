"""Data GET route."""

from http import HTTPStatus

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.data import get_data
from compose.routes.data import data_bp
from compose.schemas.api.data.get import DataGetQueryParams, DataGetResponse
from compose.utils.auth import check_authentication


@data_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get data.

    Args:
        user (User): user extracted from token.

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = DataGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = DataGetResponse(
            msg="query validation error", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = DataGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Get data from the DB
    try:
        data_list = get_data(query_params, user)
    except SQLAlchemyError:
        response_body = DataGetResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except ValidationError as e:
        response_body = DataGetResponse(
            msg="query validation error", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = DataGetResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched data in response
    response_body = DataGetResponse(
        msg="data successfully retrieved", items={"data_list": data_list}
    )
    return make_response(response_body.json(), HTTPStatus.OK)
