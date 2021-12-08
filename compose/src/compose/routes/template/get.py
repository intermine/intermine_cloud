"""Template GET route."""

from http import HTTPStatus

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.template import get_template
from compose.routes.template import template_bp
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateGetResponse
from compose.utils.auth import check_authentication


@template_bp.get("/")
@check_authentication
def get(user: User) -> Response:
    """Get template.

    Args:
        user (User): Extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse query params from request
    try:
        query_params = TemplateGetQueryParams.parse_obj(request.args)
    except ValidationError as e:
        response_body = TemplateGetResponse(
            msg="query validation error", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = TemplateGetResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Get template from the DB
    try:
        template_list = get_template(query_params)
    except SQLAlchemyError:
        response_body = TemplateGetResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = TemplateGetResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched templates in response
    response_body = TemplateGetResponse(
        msg=" successfully retrieved", items=template_list
    )
    return make_response(response_body.json(), HTTPStatus.OK)
