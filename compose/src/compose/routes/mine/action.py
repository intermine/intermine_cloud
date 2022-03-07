"""Mine action API routes."""

from http import HTTPStatus
import json

from blackcap.flow import Executor, FlowExecError, FlowStatus
from blackcap.schemas.user import User
from flask import Blueprint, make_response, request, Response
from pydantic import parse_obj_as, ValidationError

from compose.blocs.mine_action import generate_create_mine_action_flow
from compose.schemas.api.mine.action.post import (
    MineActionPOSTRequest,
    MineActionPOSTResponse,
)
from compose.utils.auth import check_authentication


mine_action_bp = Blueprint("mine_action", __name__, url_prefix="/action")


@mine_action_bp.post("/")
@check_authentication
def post(user: User) -> Response:  # noqa: C901
    """Create mine action.

    Args:
        user (User): extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        mine_action_create_request_list = parse_obj_as(
            MineActionPOSTRequest, json.loads(request.data)
        ).mine_list
    except ValidationError as e:
        response_body = MineActionPOSTResponse(
            msg="json validation failed", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = MineActionPOSTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Generate create mine action flow
    try:
        create_mine_action_flow = generate_create_mine_action_flow(
            mine_action_create_request_list, user
        )
    except FlowExecError:
        response_body = MineActionPOSTResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = MineActionPOSTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Excute the flow
    executor = Executor(create_mine_action_flow, {})
    executed_flow = executor.run()

    # Check flow status and return
    if executed_flow.status == FlowStatus.PASSED:
        # return fetched data in response
        response_body = MineActionPOSTResponse(
            msg="data successfully created",
            items={
                "mine_list": executed_flow.forward_outputs[-1][0].data,
            },
        )
        return make_response(response_body.json(), HTTPStatus.OK)
    else:
        # handle errors
        # return processed errors in response
        response_body = MineActionPOSTResponse(
            msg="failed to create data", errors={"main": []}
        )
        return make_response(response_body.json(), HTTPStatus.OK)
