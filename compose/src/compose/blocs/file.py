"""File BLoCs."""

from ctypes import Union
from datetime import timedelta
from typing import List

from blackcap.db import DBSession
from blackcap.flow import FlowExecError, get_outer_function, Prop
from blackcap.schemas.user import User
from logzero import logger
from minio import Minio
from minio.deleteobjects import DeleteObject
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError


from compose.configs import config_registry
from compose.models.file import FileDB
from compose.schemas.api.file.delete import FileDelete
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.post import FileCreate
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.schemas.template import Template


config = config_registry.get_config()

# Initialize minio clinet
minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=config.MINIO_SECURE,
)


def create_presigned_url(file: File, user_creds: User, method: str) -> str:
    """Create presigned post url for the file.

    Args:
        file (File): File object
        user_creds (User): User credentials.
        method (str): HTTP Method

    Returns:
        str: Presigned url
    """
    return minio_client.get_presigned_url(
        method,
        f"protagonist-{user_creds.user_id}",
        f"{str(file.file_id)}.{file.ext}",
        expires=timedelta(days=7),
    )


def create_file(file_create_list: List[FileCreate], user_creds: User) -> List[File]:
    """Create file objects.

    Args:
        file_create_list (List[FileCreate]): List of file objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception: Database error

    Returns:
        List[File]: Created file objects
    """
    with DBSession() as session:
        try:
            file_db_create_list: List[FileDB] = [
                FileDB(
                    protagonist_id=user_creds.user_id,
                    **file.dict(),
                )
                for file in file_create_list
            ]
            FileDB.bulk_create(file_db_create_list, session)
            return [
                File(
                    file_id=obj.id,
                    **obj.to_dict(),
                )
                for obj in file_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create files: {e}")
            raise e


def get_file(query_params: FileGetQueryParams, user_creds: User) -> List[File]:
    """Query DB for Files.

    Args:
        query_params (FileGetQueryParams): Query params from request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[File]: List of Files returned from DB
    """
    file_list: List[FileDB] = []

    stmt = ""

    if query_params.query_type == FileQueryType.GET_ALL_FILES:
        stmt = select(FileDB).where(FileDB.protagonist_id == user_creds.user_id)
    if query_params.query_type == FileQueryType.GET_FILE_BY_ID:
        stmt = (
            select(FileDB)
            .where(FileDB.protagonist_id == user_creds.user_id)
            .where(FileDB.id == query_params.file_id)
        )
    if query_params.query_type == FileQueryType.GET_FILES_BY_PROTAGONIST_ID:
        stmt = select(FileDB).where(FileDB.id == user_creds.user_id)

    with DBSession() as session:
        try:
            file_list: List[FileDB] = session.execute(stmt).scalars().all()
            return [
                File(
                    file_id=obj.id,
                    presigned_get=create_presigned_url(obj, user_creds, "GET"),
                    presigned_put=create_presigned_url(obj, user_creds, "PUT"),
                    **obj.to_dict(),
                )
                for obj in file_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch files due to {e}")
            raise e


def update_file(file_update_list: List[FileUpdate], user_creds: User) -> List[File]:
    """Update File in the DB from FileUpdate request.

    Args:
        file_update_list (List[FileUpdate]): ListFileUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[File]: List of Instance of Updated File
    """
    stmt = (
        select(FileDB)
        .where(FileDB.protagonist_id == user_creds.user_id)
        .where(FileDB.id.in_([file_update.file_id for file_update in file_update_list]))
    )
    with DBSession() as session:
        try:
            file_db_update_list: List[FileDB] = session.execute(stmt).scalars().all()
            updated_file_list = []
            for file in file_db_update_list:
                for file_update in file_update_list:
                    if file_update.file_id == file.id:
                        file_update_dict = file_update.dict(exclude_defaults=True)
                        file_update_dict.pop("file_id")
                        updated_file = file.update(session, **file_update_dict)
                        updated_file_list.append(
                            File(file_id=updated_file.id, **updated_file.to_dict())
                        )
            return updated_file_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update file: {file.to_dict()} due to {e}")
            raise e


def delete_file(file_delete: List[FileDelete], user_creds: User) -> List[File]:
    """Delete file in the DB from FileDelete request.

    Args:
        file_delete (List[FileDelete]): List of FileDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[File]: List of Instance of Deleted File
    """
    stmt = (
        select(FileDB)
        .where(FileDB.protagonist_id == user_creds.user_id)
        .where(FileDB.id.in_([file.file_id for file in file_delete]))
    )
    with DBSession() as session:
        try:
            file_db_delete_list: List[FileDB] = session.execute(stmt).scalars().all()
            deleted_file_list = []
            for file in file_db_delete_list:
                file.delete(session)
                deleted_file_list.append(File(file_id=file.id, **file.to_dict()))
            return deleted_file_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete file: {file.to_dict()} due to {e}")
            raise e


###
# Flow BLoCs
###


def create_file_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for creating file step.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_parent_list
                    Prop(data=created_parent_list, description="List of created data objects")
                1: user
                    Prop(data=user, description="User")


    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Created file objects

            Prop(data=created_file_list, description="List of created File Objects")

            Prop(data=user, description="User")
    """
    try:
        created_parent_list: List[Union[Data, Template]] = inputs[0].data
        user: User = inputs[1].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    try:
        file_create_list = []
        for parent in created_parent_list:
            file_create_list.append(
                FileCreate(
                    name=parent.name,
                    ext=parent.ext,
                    file_type=parent.file_type,
                    parent_id=parent.get_id(),
                )
            )
        created_file_list = create_file(file_create_list, user)
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
        Prop(data=created_file_list, description="List of created File Objects"),
        Prop(data=user, description="User"),
    ]


def revert_file_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Backward function for creating file step.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_parent_list
                    Prop(data=created_parent_list, description="List of created data objects")
                1: user
                    Prop(data=user, description="User")
                2: created_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Deleted file objects

            Prop(data=deleted_file_list, description="List of deleted File Objects")

            Prop(data=user, description="User")
    """
    try:
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

    try:
        deleted_file_list = delete_file(created_file_list, user)
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
        Prop(data=deleted_file_list, description="List of deleted Data Objects"),
        Prop(data=user, description="User"),
    ]


def create_file_presigned_urls(inputs: List[Prop]) -> List[Prop]:
    """Forward function for creating presigned url using created file object.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                1: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Updated data objects

            Prop(data=updated_file_list, description="List of updated File Objects")

            Prop(data=user, description="User")
    """
    try:
        created_file_list: List[File] = inputs[0].data
        user: User = inputs[1].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e
    try:
        for file in created_file_list:
            file.presigned_put = create_presigned_url(file, user, "PUT")
            file.presigned_get = create_presigned_url(file, user, "GET")
    except Exception as e:
        raise FlowExecError(
            human_description="Creating presigned urls failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(data=created_file_list, description="List of updated File Objects"),
        Prop(data=user, description="User"),
    ]


def delete_file_s3_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for deleting file in s3 step.

    Args:
        inputs (List[Prop]):
            Expects
                0: file_delete_list
                    Prop(data=file_delete_list, description="List of files to delete")
                1: user
                    Prop(data=user, description="User")


    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            deleted file objects

            Prop(data=deleted_file_list, description="List of deleted File Objects")

            Prop(data=user, description="User")
    """
    try:
        file_list: List[File] = inputs[0].data
        user: User = inputs[1].data
    except Exception as e:
        raise FlowExecError(
            human_description="Parsing inputs failed",
            error=e,
            error_type=type(e),
            is_user_facing=True,
            error_in_function=get_outer_function(),
        ) from e

    try:
        file_delete_list = []
        for file in file_list:
            file_delete_list.append(DeleteObject(f"{str(file.file_id)}.{file.ext}"))
        minio_client.remove_objects(f"protagonist-{user.user_id}", file_delete_list)
    except Exception as e:
        raise FlowExecError(
            human_description="Something bad happened",
            error=e,
            error_type=type(e),
            is_user_facing=False,
            error_in_function=get_outer_function(),
        ) from e

    return [
        Prop(data=file_list, description="List of deleted File Objects"),
        Prop(data=user, description="User"),
    ]
