"""User POST route."""

from http import HTTPStatus
import json
from typing import List

from blackcap.blocs.user import create_user
from blackcap.schemas.api.user.post import UserCreate, UserPOSTResponse
from flask import make_response, request, Response
from minio.api import Minio
from pydantic import parse_obj_as, ValidationError
from sqlalchemy.exc import SQLAlchemyError

from compose.configs import config_registry
from compose.routes.user import user_bp

config = config_registry.get_config()

# Initialize minio clinet
minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=config.MINIO_SECURE,
)


@user_bp.post("/")
def post() -> Response:
    """Create user.

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        user_create = parse_obj_as(List[UserCreate], (json.loads(request.data)))
    except ValidationError as e:
        response_body = UserPOSTResponse(
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = UserPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Create user
    try:
        user = create_user(user_create)
    except SQLAlchemyError:
        response_body = UserPOSTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = UserPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Create user bucket
    # TODO: Make this part of the flow or better add it as a post script
    try:
        for u in user:
            minio_client.make_bucket(f"protagonist-{u.user_id}")
    except Exception:
        response_body = UserPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # return fetched data in response
    response_body = UserPOSTResponse(msg="user successfully created", items=user)
    return make_response(response_body.json(), HTTPStatus.OK)
