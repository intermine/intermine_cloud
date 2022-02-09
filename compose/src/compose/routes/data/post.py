"""Data POST route."""

from http import HTTPStatus
import json

from blackcap.flow import Executor, FlowExecError, FlowStatus
from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError


from compose.blocs.data import generate_create_data_flow
from compose.routes.data import data_bp
from compose.schemas.api.data.post import DataPOSTResponse, DataPOSTRequest
from compose.utils.auth import check_authentication


@data_bp.post("/")
@check_authentication
def post(user: User) -> Response:  # noqa: C901
    """Create data.

    Args:
        user (User): extracted user from request

    Returns:
        Response: Flask response
    """
    # Parse json from request
    try:
        data_create_request_list = parse_obj_as(
            DataPOSTRequest, json.loads(request.data)
        )["data"]
    except ValidationError as e:
        response_body = DataPOSTResponse(
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = DataPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Generate create data flow
    try:
        create_data_flow = generate_create_data_flow(data_create_request_list, user)
    except FlowExecError:
        response_body = DataPOSTResponse(
            msg="internal databse error", errors=["internal database error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
    except Exception:
        response_body = DataPOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    # Excute the flow
    executor = Executor(create_data_flow, {})
    executed_flow = executor.run()

    # Check flow status and return
    if executed_flow.status == FlowStatus.PASSED:
        # return fetched data in response
        response_body = DataPOSTResponse(
            msg="data successfully created",
            items=executed_flow.forward_outputs[-1][0]["data"],
        )
        return make_response(response_body.json(), HTTPStatus.OK)
    else:
        # handle errors
        # return processed errors in response
        response_body = DataPOSTResponse(msg="failed to create data", errors=[])
        return make_response(response_body.json(), HTTPStatus.OK)
