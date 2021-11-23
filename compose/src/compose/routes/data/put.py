# """User POST route."""

# from http import HTTPStatus
# import json
# from typing import List

# from flask import make_response, request, Response
# from pydantic import parse_obj_as, ValidationError
# from sqlalchemy.exc import SQLAlchemyError

# from compose.blocs.data import create_data
# from compose.blocs.file import create_file
# from compose.routes.data import data_bp
# from compose.schemas.api.data.put import DataUpdate
# from compose.schemas.data import Data
# from compose.schemas.file import File


# @data_bp.put("/")
# def put() -> Response:  # noqa: C901
#     """Update data.

#     Returns:
#         Response: Flask response
#     """
#     # Parse json from request
#     try:
#         data_create = parse_obj_as(List[DataUpdate], (json.loads(request.data)))
#     except ValidationError as e:
#         response_body = DataPUTResponse(msg="json validation failed", errors=e.errors())
#         return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
#     except Exception:
#         response_body = DataPUTResponse(
#             msg="unknown error", errors=["unknown internal error"]
#         )
#         return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

#     # Create data
#     try:
#         created_data = create_data(data_create)
#     except SQLAlchemyError:
#         response_body = DataPUTResponse(
#             msg="internal databse error", errors=["internal database error"]
#         )
#         return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)
#     except Exception:
#         response_body = DataPUTResponse(
#             msg="unknown error", errors=["unknown internal error"]
#         )
#         return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

#     # return fetched data in response
#     response_body = DataPUTResponse(msg="data successfully created", items=created_data)
#     return make_response(response_body.json(), HTTPStatus.OK)
