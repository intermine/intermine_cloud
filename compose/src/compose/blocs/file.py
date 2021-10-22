"""File BLoCs."""

from typing import List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User

from compose.models.file import FileDB
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.delete import FileDelete
from compose.schemas.file import File

from logzero import logger

from sqlalchemy import select


def create_file(file_list: List[File], user_creds: Optional[User] = None) -> List[File]:
    """Create file objects.

    Args:
        file_list (List[File]): List of file objects to create.
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Returns:
        List[File]: Created file objects
    """
    with DBSession() as session:
        try:
            file_db_create_list: List[FileDB] = [
                FileDB(
                    protagonist_id=user_creds.user_id,
                    **file.dict(exclude={"file_id"}),  # noqa: E501
                )
                for file in file_list
            ]
            FileDB.bulk_create(file_db_create_list, session)
            return [
                File(file_id=obj.id, **obj.to_dict())
                for obj in file_db_create_list  # noqa: E501
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create files: {e}")
            raise e


def get_file(query_params: FileGetQueryParams) -> List[File]:
    """Query DB for Files.

    Args:
        query_params (FileGetQueryParams): Query params from request

    Raises:
        Exception: error

    Returns:
        List[File]: List of Files returned from DB
    """
    file_list: List[FileDB] = []

    stmt = ""

    if query_params.query_type == FileQueryType.GET_ALL_FILES:
        stmt = select(FileDB)
    if query_params.query_type == FileQueryType.GET_FILES_BY_ID:
        stmt = select(FileDB).where(FileDB.id == query_params.file_id)
    if query_params.query_type == FileQueryType.GET_FILES_BY_PROTAGONIST_ID:
        stmt = select(FileDB).where(FileDB.id == query_params.protagonist_id)

    with DBSession() as session:
        try:
            file_list: List[FileDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            return [File(file_id=obj.id, **obj.to_dict()) for obj in file_list]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch files due to {e}")
            raise e

    return file_list


def delete_file(file_delete: FileDelete) -> File:
    """Delete file in the DB from FileDelete request.

    Args:
        file_delete (FileDelete): FileDelete request

    Raises:
        Exception: error

    Returns:
        File: Instance of Deleted File
    """
    stmt = select(FileDB).where(FileDB.id == file_delete.file_id)
    with DBSession() as session:
        try:
            file_list: List[FileDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(file_list) == 1:
                deleted_file = file_list[0].delete(session)
                return File(file_id=deleted_file.id, **deleted_file.to_dict())
            if len(file_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete file: {file_delete.dict()} due to {e}"
            )  # noqa: E501
            raise e
