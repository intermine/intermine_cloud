"""Data BLoCs."""

from typing import List, Optional

from blackcap.db import DBSession
from blackcap.schemas.user import User

from compose.models.data import DataDB
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.data.put import DataUpdate
from compose.schemas.api.data.delete import DataDelete
from compose.schemas.data import Data

from logzero import logger

from sqlalchemy import select


def create_data(data_list: List[Data], user_creds: Optional[User] = None) -> List[Data]:
    """Create data objects.

    Args:
        data_list (List[Data]): List of data objects to create.
        user_creds (Optional[User], optional): User credentials. Defaults to None.

    Returns:
        List[Data]: Created data objects
    """
    with DBSession() as session:
        try:
            data_db_create_list: List[DataDB] = [
                DataDB(
                    protagonist_id=user_creds.user_id,
                    **data.dict(exclude={"data_id"}),  # noqa: E501
                )
                for data in data_list
            ]
            DataDB.bulk_create(data_db_create_list, session)
            return [
                Data(data_id=obj.id, **obj.to_dict())
                for obj in data_db_create_list  # noqa: E501
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create data: {e}")
            raise e


def get_data(query_params: DataGetQueryParams) -> List[Data]:
    """Query DB for Data.

    Args:
        query_params (DataGetQueryParams): Query params from request

    Raises:
        Exception: error

    Returns:
        List[Data]: List of Data returned from DB
    """

    stmt = ""

    if query_params.query_type == DataQueryType.GET_ALL_DATA:
        stmt = select(DataDB)
    if query_params.query_type == DataQueryType.GET_DATA_BY_ID:
        stmt = select(DataDB).where(DataDB.id == query_params.data_id)
    if query_params.query_type == DataQueryType.GET_DATA_BY_PROTAGONIST_ID:
        stmt = select(DataDB).where(DataDB.id == query_params.protagonist_id)

    with DBSession() as session:
        try:
            data_list: List[DataDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            return [Data(data_id=obj.id, **obj.to_dict()) for obj in data_list]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch data due to {e}")
            raise e


def update_data(data_update: DataUpdate) -> Data:
    """Update Data in the DB from DataUpdate request.

    Args:
        data_update (DataUpdate): DataUpdate request

    Raises:
        Exception: error

    Returns:
        Data: Instance of Updated Data
    """
    stmt = select(DataDB).where(DataDB.id == data_update.data_id)
    with DBSession() as session:
        try:
            data_list: List[DataDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(data_list) == 1:
                data_update_dict = data_update.dict()
                data_update_dict.pop("data_id")
                updated_data = data_list[0].update(
                    session, **data_update.dict()
                )  # noqa: E501
                return Data(data_id=updated_data.id, **updated_data.to_dict())
            if len(data_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to update data: {data_update.dict()} due to {e}"
            )  # noqa: E501
            raise e


def delete_data(data_delete: DataDelete) -> Data:
    """Delete Data in the DB from DataDelete request.

    Args:
        Data_delete (DataDelete): DataDelete request

    Raises:
        Exception: error

    Returns:
        Data: Instance of Deleted Data
    """
    stmt = select(DataDB).where(DataDB.id == data_delete.data_id)
    with DBSession() as session:
        try:
            data_list: List[DataDB] = (
                session.execute(stmt).scalars().all()
            )  # noqa: E501
            if len(data_list) == 1:
                deleted_data = data_list[0].delete(session)
                return Data(data_id=deleted_data.id, **deleted_data.to_dict())
            if len(data_list) == 0:
                # TODO: Raise not found
                pass
        except Exception as e:
            session.rollback()
            logger.error(
                f"Unable to delete data: {data_delete.dict()} due to {e}"
            )  # noqa: E501
            raise e
