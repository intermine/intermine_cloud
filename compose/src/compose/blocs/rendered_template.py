"""RenderedTemplate BLoCs."""

from typing import List
from pathlib import Path
import shutil
from tempfile import TemporaryDirectory

from blackcap.db import DBSession
from blackcap.flow import FlowExecError, get_outer_function, Prop
from blackcap.schemas.user import User
from logzero import logger
from pydantic import ValidationError
from pydantic.error_wrappers import ErrorWrapper
import requests
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from compose.models.rendered_templates import RenderedTemplateDB
from compose.schemas.api.rendered_template.delete import RenderedTemplateDelete
from compose.schemas.api.rendered_template.get import (
    RenderedTemplateGetQueryParams,
    RenderedTemplateQueryType,
)
from compose.schemas.api.rendered_template.post import RenderedTemplateCreate
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import RenderedTemplate, Template
from compose.utils.io import make_archive

###
# CRUD BLoCs
###


def create_rendered_template(
    rendered_template_list: List[RenderedTemplateCreate], user_creds: User
) -> List[RenderedTemplate]:
    """Create rendered template objects.

    Args:
        rendered_template_list (List[RenderedTemplateCreate]): List of rendered template objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception: database error

    Returns:
        List[RenderedTemplate]: Created rendered template objects
    """
    with DBSession() as session:
        try:
            rendered_template_db_create_list: List[RenderedTemplateDB] = [
                RenderedTemplateDB(
                    protagonist_id=user_creds.user_id,
                    **rendered_template.dict(),
                )
                for rendered_template in rendered_template_list
            ]
            RenderedTemplateDB.bulk_create(rendered_template_db_create_list, session)
            return [
                RenderedTemplate(rendered_template_id=obj.id, **obj.to_dict())
                for obj in rendered_template_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create renderded templates: {e}")
            raise e


def get_rendered_template(
    query_params: RenderedTemplateGetQueryParams, user_creds: User
) -> List[RenderedTemplate]:
    """Query DB for RenderedTemplates.

    Args:
        query_params (RenderedTemplateGetQueryParams): Query params from request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of RenderedTemplates returned from DB
    """
    stmt = ""

    if query_params.query_type == RenderedTemplateQueryType.GET_ALL_RENDERED_TEMPLATES:
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.protagonist_id == user_creds.user_id
        )
    if query_params.query_type == RenderedTemplateQueryType.GET_RENDERED_TEMPLATE_BY_ID:
        if query_params.template_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "template_id"),
                ],
                model=RenderedTemplateGetQueryParams,
            )
            raise e
        stmt = (
            select(RenderedTemplateDB)
            .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
            .where(RenderedTemplateDB.id == query_params.template_id)
        )
    if (
        query_params.query_type
        == RenderedTemplateQueryType.GET_RENDERED_TEMPLATES_BY_PROTAGONIST_ID
    ):
        if query_params.protagonist_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "protagonist_id"),
                ],
                model=RenderedTemplateGetQueryParams,
            )
            raise e
        stmt = select(RenderedTemplateDB).where(
            RenderedTemplateDB.id == user_creds.user_id
        )

    with DBSession() as session:
        try:
            rendered_template_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            return [
                RenderedTemplate(renderedtemplate_id=obj.id, **obj.to_dict())
                for obj in rendered_template_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch rendered_templates due to {e}")
            raise e


def update_rendered_template(
    rendered_template_update_list: List[RenderedTemplateUpdate], user_creds: User
) -> List[RenderedTemplate]:
    """Update RenderedTemplate in the DB from RenderedTemplateUpdate request.

    Args:
        rendered_template_update_list (List[RenderedTemplateUpdate]): List of RenderedTemplateUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of Instance of Updated RenderedTemplate
    """
    stmt = (
        select(RenderedTemplateDB)
        .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
        .where(
            RenderedTemplateDB.id.in_(
                [
                    rendered_template_update.rendered_template_id
                    for rendered_template_update in rendered_template_update_list
                ]
            )
        )
    )
    with DBSession() as session:
        try:
            rendered_template_db_update_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            updated_rendered_template_list = []
            for rendered_template in rendered_template_db_update_list:
                for rendered_template_update in rendered_template_update_list:
                    if (
                        rendered_template_update.rendered_template_id
                        == rendered_template.id
                    ):
                        rendered_template_update_dict = rendered_template_update.dict(
                            exclude_defaults=True
                        )
                        rendered_template_update_dict.pop("rendered_template_id")
                        updated_rendered_template = rendered_template.update(
                            session, **rendered_template_update_dict
                        )
                        updated_rendered_template_list.append(
                            RenderedTemplate(
                                rendered_template_id=updated_rendered_template.id,
                                **updated_rendered_template.to_dict(),
                            )
                        )
            return updated_rendered_template_list
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to update rendered_template: {rendered_template.to_dict()} due to {e}"
            )
            raise e


def delete_rendered_template(
    rendered_template_delete_list: List[RenderedTemplateDelete], user_creds: User
) -> List[RenderedTemplate]:
    """Delete rendered template in the DB from RenderedTemplateDelete request.

    Args:
        rendered_template_delete_list (List[RenderedTemplateDelete]): List of RenderedTemplateDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[RenderedTemplate]: List of Instance of Deleted RenderedTemplate
    """
    stmt = (
        select(RenderedTemplateDB)
        .where(RenderedTemplateDB.protagonist_id == user_creds.user_id)
        .where(
            RenderedTemplateDB.id.in_(
                [
                    rendered_template.rendered_template_id
                    for rendered_template in rendered_template_delete_list
                ]
            )
        )
    )
    with DBSession() as session:
        try:
            rendered_template_db_delete_list: List[RenderedTemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            deleted_rendered_template_list = []
            for rendered_template in rendered_template_db_delete_list:
                rendered_template.delete(session)
                deleted_rendered_template_list.append(
                    RenderedTemplate(
                        rendered_template_id=rendered_template.id,
                        **rendered_template.to_dict(),
                    )
                )
            return deleted_rendered_template_list
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete rendered_template: {rendered_template.to_dict()} due to {e}"
            )
            raise e


###
# Flow BLoCs
###


def create_rendered_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: checked_template_list
                    Prop(data=checked_template_list, description="List of checked template objects")
                1: checked_template_file_list
                    Prop(data=checked_template_file_list, description="List of checked template file objects")
                2: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Created rendered_template objects

            Prop(data=created_rendered_template_list, description="List of created rendered_template Objects")

            Prop(data=user, description="User")
    """
    try:
        checked_template_list: List[Template] = inputs[0].data
        user: User = inputs[2].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    try:
        rendered_template_create_request_list = [
            RenderedTemplateCreate(
                name=template.name,
                description=template.description,
                parent_template_id=template.template_id,
            )
            for template in checked_template_list
        ]
        created_rendered_template_list = create_rendered_template(
            rendered_template_create_request_list, user
        )
    except SQLAlchemyError as e:
        raise FlowExecError(
            human_description="Creating DB object failed",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e
    except Exception as e:
        raise FlowExecError(
            human_description="Something bad happened",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(
            data=created_rendered_template_list,
            description="List of created rendered_template Objects",
        ),
        Prop(data=user, description="User"),
    ]


def revert_rendered_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Revert function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: rendered_template_create_request_list
                    Prop(data=data_create_request_list, description="List of create data objects")
                2: user
                    Prop(data=user, description="User")
                3: created_rendered_template_list
                    Prop(data=created_rendered_template_list, description="List of created rendered_template objects")
                4: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Deleted rendered_template objects

            Prop(data=deleted_rendered_template_list, description="List of deleted rendered_template Objects")

            Prop(data=user, description="User")
    """
    try:
        created_rendered_template_list: List[RenderedTemplate] = inputs[3].data
        user: User = inputs[4].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    try:
        deleted_rendered_template_list = delete_rendered_template(
            created_rendered_template_list, user
        )
    except SQLAlchemyError as e:
        raise FlowExecError(
            human_description="Deleting DB object failed",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e
    except Exception as e:
        raise FlowExecError(
            human_description="Something bad happened",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(
            data=deleted_rendered_template_list,
            description="List of deleted rendered_template Objects",
        ),
        Prop(data=user, description="User"),
    ]


def update_rendered_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for updating mine info in created rendered_template object.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_mine_list
                    Prop(data=created_mine_list, description="List of created mine objects")
                1: user
                    Prop(data=user, description="User")
                2: craeted_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Updated rendered_template objects

            Prop(data=updated_rendered_template_list, description="List of updated rendered_template Objects")

            Prop(data=user, description="User")
    """
    try:
        created_mine_list: List[Mine] = inputs[0].data
        created_file_list: List[File] = inputs[2].data
        user: User = inputs[3].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    rendered_template_update_list: List[RenderedTemplateUpdate] = []
    for file in created_file_list:
        rendered_template_update = RenderedTemplateUpdate(
            rendered_template_id=file.parent_id, file_id=file.file_id
        )
        rendered_template_update_list.append(rendered_template_update)

    # TODO: Optimize later
    for mine in created_mine_list:
        for rendered_template_update in rendered_template_update_list:
            if mine.rendered_template_file_id == rendered_template_update.file_id:
                rendered_template_update.parent_mine_id = mine.mine_id

    try:
        updated_rendered_template_list = update_rendered_template(
            rendered_template_update_list, user
        )
    except SQLAlchemyError as e:
        raise FlowExecError(
            human_description="Updating DB object failed",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e
    except Exception as e:
        raise FlowExecError(
            human_description="Something bad happened",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(
            data=updated_rendered_template_list,
            description="List of updated rendered_template Objects",
        ),
        Prop(data=user, description="User"),
    ]


def rewind_rendered_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Backward function for updating rendered_template step.

    Args:
        inputs (List[Prop]):
            Expects
                0: craeted_mine_list
                    Prop(data=created_mine_list, description="List of created mine objects")
                1: craeted_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                2: user
                    Prop(data=user, description="User")
                3: updated_rendered_template_list
                    Prop(data=updated_rendered_template_list, description="List of updated rendered_template objects")
                4: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Reverted data objects

            Prop(data=reverted_data_list, description="List of reverted Data Objects")

            Prop(data=user, description="User")
    """
    try:
        updated_rendered_template_list = inputs[3].data
        user = inputs[4].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    # NOTE: This the last step of the flow. So this function is not needed at the moment.
    # NOTE: So, this is just a skeleton for future implementation, if needed.

    return [
        Prop(
            data=updated_rendered_template_list,
            description="List of updated rendered_template Objects",
        ),
        Prop(data=user, description="User"),
    ]


def render_and_upload_rendered_template(inputs: List[Prop]) -> List[Prop]:
    """Forward function for rendering and uploading rendered_template object.

    Args:
        inputs (List[Prop]):
            Expects
                0: craeted_rendered_template_list
                    Prop(data=created_rendered_template_list, description="List of created rendered_template objects")
                1: user
                    Prop(data=user, description="User")
                2: created_rendered_template_file_list
                    Prop(data=created_rendered_template_file_list, description="List of created file objects")
                3: user
                    Prop(data=user, description="User")
                4: template_list
                    Prop(data=template_list, description="List of checked template objects")
                5: template_file_list
                    Prop(data=template_file_list, description="List of created file objects")
                6: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            created rendered_template objects

            Prop(data=created_rendered_template_list, description="List of created rendered_template Objects")

            Prop(data=user, description="User")
    """
    try:
        created_rendered_template_list: List[RenderedTemplate] = inputs[0].data
        rendered_template_file_list: List[File] = inputs[2].data
        checked_template_list: List[File] = inputs[4].data
        checked_template_file_list: List[File] = inputs[5].data
        user: User = inputs[6].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    try:
        for rendered_template in created_rendered_template_list:
            # Create archive of the rendered template in a temp dir
            with TemporaryDirectory() as tempd:
                tempd = Path(tempd)
                for file in checked_template_file_list:
                    # find the right file
                    if (
                        file.parent_id == rendered_template.parent_template_id
                        and file.uploaded is True
                    ):

                        # Download template
                        download_and_unpack_archive(
                            file.presigned_get, tempd, f"template_{file.parent_id}"
                        )

                        # Render the fetched template with provided template vars
                        # TODO: Do it properly later, for now just cp the downloaded template
                        shutil.copytree(
                            Path(tempd)
                            .absolute()
                            .joinpath(f"template_{file.parent_id}"),
                            Path(tempd)
                            .absolute()
                            .joinpath(f"rendered_{file.parent_id}"),
                            dirs_exist_ok=True,
                        )

                        # get upload url
                        for check_file in rendered_template_file_list:
                            if (
                                check_file.parent_id
                                == rendered_template.rendered_template_id
                            ):
                                upload_url = check_file.presigned_put

                        # Craete archive and upload
                        make_archive_and_upload(
                            upload_url, f"rendered_{file.parent_id}", tempd
                        )

    except Exception as e:
        raise FlowExecError(
            human_description=f"Something bad happened, file: {file}, {file.presigned_get}",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(
            data=created_rendered_template_list,
            description="List of created rendered_template Objects",
        ),
        Prop(data=user, description="User"),
    ]


def download_and_unpack_archive(
    download_url: str, download_path: Path, file_name: str, unpack: bool = True
) -> None:
    """Download and unpack archives from object storage."""
    resp = requests.get(download_url, stream=True)
    with open(f"{download_path.joinpath(file_name)}.tar", "wb") as download_file:
        for data in resp.iter_content(chunk_size=1024):
            download_file.write(data)

    if unpack is True:
        # Unpack archive
        shutil.unpack_archive(
            download_path.joinpath(f"{file_name}.tar"),
            download_path.joinpath(file_name),
        )


def make_archive_and_upload(
    upload_url: str, archive_name: str, file_path: Path
) -> None:
    """Create archive and upload to S3."""
    archive_path = make_archive(
        archive_name,
        file_path.joinpath(archive_name),
        file_path,
    )

    # upload rendered template
    with open(archive_path, "rb") as f:
        requests.put(
            url=upload_url,
            data=f,
        )
