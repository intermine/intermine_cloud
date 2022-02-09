"""File BLoCs."""

from datetime import timedelta
from typing import List
from uuid import uuid4

from blackcap.db import DBSession
from blackcap.schemas.user import User
from logzero import logger
from minio.api import Minio
from sqlalchemy import select

from compose.configs import config_registry
from compose.models.file import FileDB
from compose.schemas.api.file.delete import FileDelete
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.post import FileCreate
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.file import File


config = config_registry.get_config()

# Initialize minio clinet
minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=config.MINIO_SECURE,
)


def create_presigned_post_url(file: File, user_creds: User, method: str) -> str:
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
                    id=uuid4(),
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
                    presigned_url=create_presigned_post_url(obj, user_creds, "GET"),
                    **obj.to_dict(),
                )
                for obj in file_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch files due to {e}")
            raise e

    return file_list


def update_file(file_update: FileUpdate, user_creds: User = None) -> File:
    """Update File in the DB from FileUpdate request.

    Args:
        file_update (FileUpdate): FileUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        File: Instance of Updated File
    """
    stmt = select(FileDB).where(FileDB.id == file_update.file_id)
    with DBSession() as session:
        try:
            file_list: List[FileDB] = session.execute(stmt).scalars().all()
            if len(file_list) == 1:
                file_update_dict = file_update.dict(exclude_defaults=True)
                file_update_dict.pop("file_id")
                updated_file = file_list[0].update(session, **file_update_dict)
                return File(file_id=updated_file.id, **updated_file.to_dict())
            if len(file_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update file: {file_update.dict()} due to {e}")
            raise e


def delete_file(file_delete: List[FileDelete], user_creds: User) -> File:
    """Delete file in the DB from FileDelete request.

    Args:
        file_delete (List[FileDelete]): List of FileDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        File: Instance of Deleted File
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
                deleted_file = file.delete(session)
                deleted_file_list.append(
                    File(file_id=deleted_file.id, **deleted_file.to_dict())
                )
            return deleted_file_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete file: {file.dict()} due to {e}")
            raise e
