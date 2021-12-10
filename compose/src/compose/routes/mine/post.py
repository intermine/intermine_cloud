"""Mine POST route."""

from http import HTTPStatus
import json
from pathlib import Path
import shutil
from tempfile import TemporaryDirectory
from typing import List


from blackcap.schemas.user import User
from flask import make_response, request, Response
from pydantic import parse_obj_as, ValidationError
from pydantic.error_wrappers import ErrorWrapper
import requests

from compose.blocs.data import get_data
from compose.blocs.file import create_file, get_file, update_file
from compose.blocs.mine import create_mine
from compose.blocs.rendered_template import (
    create_rendered_template,
    update_rendered_template,
)
from compose.blocs.template import get_template
from compose.routes.mine import mine_bp
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.api.mine.post import MinePOSTResponse
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import RenderedTemplate
from compose.utils.auth import check_authentication


def make_archive(name: str, in_path: Path, out_path: Path) -> str:
    """Create archive in a temp dir.

    Args:
        name (str): name of the archive excluding ext
        in_path (Path): dir to archive
        out_path (Path): output dir

    Returns:
        str: Path of created archive
    """
    return shutil.make_archive(out_path.joinpath(name), "tar", in_path)


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
        mine_create = parse_obj_as(List[Mine], json.loads(request.data))
    except ValidationError as e:
        response_body = MinePOSTResponse(
            msg="json validation failed", errors=e.errors()
        )
        return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)
    except Exception:
        response_body = MinePOSTResponse(
            msg="unknown error", errors=["unknown internal error"]
        )
        return make_response(response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR)

    created_mines = []
    # iterate over mine list
    for mine in mine_create:
        # Check if template exist
        query_params = TemplateGetQueryParams(
            query_type=TemplateQueryType.GET_TEMPLATE_BY_ID,
            template_id=mine.template_id,
        )

        fetched_template = get_template(query_params, user)

        if len(fetched_template) == 0:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("template not found"), "template_id"),
                ],
                model=Mine,
            )

            response_body = MinePOSTResponse(
                msg="template not found", errors=e.errors()
            )
            return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)

        template = fetched_template[0]

        # get file from template
        query_params = FileGetQueryParams(
            query_type=FileQueryType.GET_FILE_BY_ID, file_id=template.latest_file_id
        )
        fetched_file = get_file(query_params, user)
        if len(fetched_file) == 0:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("template file not found"), "template_id"),
                ],
                model=Mine,
            )

            response_body = MinePOSTResponse(
                msg="template file not found", errors=e.errors()
            )
            return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)

        file = fetched_file[0]

        # Check if data files exist
        data_files = []
        for data_id in mine.data_file_ids:
            query_params = DataGetQueryParams(
                query_type=DataQueryType.GET_DATA_BY_ID, data_id=data_id
            )
            fetched_data = get_data(query_params, user)
            if len(fetched_data) == 0:
                e = ValidationError(
                    errors=[
                        ErrorWrapper(ValueError("data not found"), "data_file_ids"),
                    ],
                    model=Mine,
                )

                response_body = MinePOSTResponse(
                    msg="data not found", errors=e.errors()
                )
                return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)

            data = fetched_data[0]

            # get file from data
            query_params = FileGetQueryParams(
                query_type=FileQueryType.GET_FILE_BY_ID, file_id=data.file_id
            )
            fetched_file = get_file(query_params, user)
            if len(fetched_file) == 0:
                e = ValidationError(
                    errors=[
                        ErrorWrapper(
                            ValueError("template file not found"), "template_id"
                        ),
                    ],
                    model=Mine,
                )

                response_body = MinePOSTResponse(
                    msg="template file not found", errors=e.errors()
                )
                return make_response(response_body.json(), HTTPStatus.BAD_REQUEST)

            file = fetched_file[0]
            data_files.append(file)

        # Create archive of the rendered template in a temp dir
        with TemporaryDirectory() as tempd:
            # Create a rendered template
            rendered_template = RenderedTemplate(
                name=mine.name, description=mine.description, template_vars=[]
            )
            try:
                created_rendered_template = create_rendered_template(
                    [rendered_template], user
                )[0]
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )

            # Download template
            resp = requests.get(file.presigned_url, stream=True)
            with open(Path(tempd).joinpath("template.tar"), "wb") as download_file:
                for data in resp.iter_content(chunk_size=1024):
                    download_file.write(data)

            # Unpack archive
            shutil.unpack_archive(
                Path(tempd).joinpath("template.tar"), Path(tempd).joinpath("template")
            )

            # Render the fetched template with provided template vars
            # TODO: Do it properly later, for now just cp the downloaded template
            shutil.copytree(
                Path(tempd).joinpath("template"), Path(tempd).joinpath("rendered")
            )

            archive_path = make_archive(
                "rendered", Path(tempd).joinpath("rendered"), Path(tempd)
            )

            # Create file in db
            file = File(
                name=mine.name,
                ext="tar",
                file_type="rendered_template",
                parent_id=created_rendered_template.rendered_template_id,
            )
            try:
                created_file = create_file([file], user)[0]
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )

            # Create a mine in the db
            c_mine = Mine(
                name=mine.name,
                description=mine.description,
                preference=mine.preference,
                rendered_template_file_id=created_file.file_id,
                data_file_ids=[str(file.file_id) for file in data_files],
            )
            try:
                created_mine = create_mine([c_mine], user)[0]
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )

            # Update RenderedTemplate in db to link with file
            rendered_template_update = RenderedTemplateUpdate(
                rendered_template_id=created_rendered_template.rendered_template_id,
                file_id=created_file.file_id,
                parent_mine_id=created_mine.mine_id,
            )
            try:
                update_rendered_template(rendered_template_update)
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )

            # Upload file
            try:
                with open(archive_path, "rb") as f:
                    requests.put(
                        url=created_file.presigned_url,
                        data=f,
                    )
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )

            # Update file status to uploaded in db
            file_update = FileUpdate(file_id=created_file.file_id, uploaded=True)
            try:
                update_file(file_update)
            except Exception:
                response_body = MinePOSTResponse(
                    msg="unknown error", errors=["unknown internal error"]
                )
                return make_response(
                    response_body.json(), HTTPStatus.INTERNAL_SERVER_ERROR
                )
        created_mines.append(created_mine)

    # return created mines in response
    response_body = MinePOSTResponse(
        msg="data successfully created", items=created_mines
    )
    return make_response(response_body.json(), HTTPStatus.OK)
