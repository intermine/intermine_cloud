"""Template POST route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.file import create_file
from compose.blocs.template import create_template, update_template
from compose.routes.template import template_bp
from compose.schemas.api.template.post import TemplatePOSTResponse
from compose.schemas.api.template.put import TemplateUpdate
from compose.schemas.file import File
from compose.schemas.template import Template
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
                    name=template.name,
                    ext="tar",
                    file_type="template",
                    parent_id=template.template_id,
                )
            )
        created_files = create_file(file_create, user)
    except Exception:
        response_body = TemplatePOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    for i, template in enumerate(created_template):
        # link template and file object
        template_update = TemplateUpdate(
            template_id=template.template_id, file_id=created_files[i].file_id
        )
        update_template(template_update, user)
        # Update local template object for response
        template.latest_file_id = created_files[i].file_id
        # add presigned_url to template objects
        template.presigned_url = created_files[i].presigned_url

    # return fetched template in response
    response_body = TemplatePOSTResponse(
        msg="data successfully created", items=created_template
    )
    return make_response(response_body.json(), HTTPStatus.OK)
