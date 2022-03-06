"""Mine POST route."""

from http import HTTPStatus
import json

from blackcap.flow import Executor, FlowExecError, FlowStatus
from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError


from compose.blocs.mine import generate_create_mine_flow
from compose.routes.mine import mine_bp
from compose.schemas.api.mine.post import MinePOSTRequest, MinePOSTResponse
from compose.utils.auth import check_authentication


@mine_bp.post("/")
@check_authentication
def post(user: User) -> Response:  # noqa: C901
    """Create mine.

    Args:
        user (User): extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        mine_create_request_list = parse_obj_as(
            MinePOSTRequest, json.loads(request.data)
        ).mine_list
    except ValidationError as e:
        response_body = MinePOSTResponse(
            msg="json validation failed", errors={"main": e.errors()}
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = MinePOSTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Generate create mine flow
    try:
        create_mine_flow = generate_create_mine_flow(mine_create_request_list, user)
    except FlowExecError:
        response_body = MinePOSTResponse(
            msg="internal databse error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = MinePOSTResponse(
            msg="unknown error", errors={"main": ["unknown internal error"]}
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Excute the flow
    executor = Executor(create_mine_flow, {})
    executed_flow = executor.run()

    # Check flow status and return
    if executed_flow.status == FlowStatus.PASSED:
        # return fetched data in response
        response_body = MinePOSTResponse(
            msg="data successfully created",
            items={
                "mine_list": executed_flow.forward_outputs[-1][0].data,
            },
        )
        return make_response(response_body.json(), HTTPStatus.OK)
    else:
        # handle errors
        # return processed errors in response
        response_body = MinePOSTResponse(
            msg="failed to create data", errors={"main": []}
        )
        return make_response(response_body.json(), HTTPStatus.OK)
