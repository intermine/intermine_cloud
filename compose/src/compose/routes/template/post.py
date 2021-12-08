"""Template POST route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.schemas.user import User
from compose.schemas.api.data.put import DataUpdate
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.template import create_template, update_template
from compose.blocs.file import create_file
from compose.routes.template import template_bp
from compose.schemas.api.template.post import TemplatePOSTResponse
from compose.schemas.template import Template
from compose.schemas.file import File
from compose.utils.auth import check_authentication


@template_bp.post("/")
@check_authentication
def post(user: User) -> Response:  # noqa: C901
    """Create template.

    Args:
        user (User): extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        template_create = parse_obj_as(List[Template], json.loads(request.data))
    except ValidationError as e:
        response_body = TemplatePOSTResponse(
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = TemplatePOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Create template
    try:
        created_template = create_template(template_create, user)
    except SQLAlchemyError:
        response_body = TemplatePOSTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = TemplatePOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Create associated file
    try:
        file_create = []
        for template in created_template:
            file_create.append(
                File(
                    name=data.name,
                    ext=data.ext,
                    file_type=data.file_type,
                    parent_id=data.data_id,
                )
            )
        created_files = create_file(file_create, user)
    except Exception:
        response_body = DataPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    for i, data in enumerate(created_data):
        # link data and file object
        data_update = DataUpdate(data_id=data.data_id, file_id=created_files[i].file_id)
        update_data(data_update, user)
        # Update local data object for response
        data.file_id = created_files[i].file_id
        # add presigned_url to data objects
        data.presigned_url = created_files[i].presigned_url

    # return fetched data in response
    response_body = DataPOSTResponse(
        msg="data successfully created", items=created_data
    )
    return make_response(response_body.json(), HTTPStatus.OK)
