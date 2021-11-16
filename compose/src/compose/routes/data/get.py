"""Data GET route."""

from http import HTTPStatus

from compose.blocs.data import get_data
from compose.routes.data import data_bp
from compose.schemas.api.data.get import DataGetQueryParams, DataGetResponse

from flask import Response, make_response, request

from pydantic import ValidationError

from sqlalchemy.exc import SQLAlchemyError


@data_bp.get("/")
def get() -> Response:
    """Get data.

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = DataGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = DataGetResponse(
            msg="query validation error", errors=e.errors()
        )  # noqa: E501
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = DataGetResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501

    # Get data from the DB
    try:
        data = get_data(query_params)
    except SQLAlchemyError:
        response_body = DataGetResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501
    except ValidationError as e:
        response_body = DataGetResponse(
            msg="query validation error", errors=e.errors()
        )  # noqa: E501
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = DataGetResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(
            response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
        )  # noqa: E501

    # return fetched data in response
    response_body = DataGetResponse(
        msg="data successfully retrieved", items=data
    )  # noqa: E501
    return make_response(response_body.json(), HTTPStatus.OK)
