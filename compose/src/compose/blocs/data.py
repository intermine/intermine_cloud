"""Data BLoCs."""

from typing import List

from blackcap.db import DBSession
from blackcap.flow import Flow, FlowExecError, FuncProp, get_outer_function, Prop, Step
from blackcap.flow.step import dummy_backward
from blackcap.schemas.user import User
from logzero import logger
from pydantic import ValidationError
from pydantic.error_wrappers import ErrorWrapper
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError


from compose.blocs.file import (
    create_file_db_entry,
    create_file_presigned_urls,
    revert_file_db_entry,
)
from compose.models.data import DataDB
from compose.schemas.api.data.delete import DataDelete
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.data.post import DataCreate
from compose.schemas.api.data.put import DataUpdate
from compose.schemas.data import Data
from compose.schemas.file import File


###
# CRUD BLoCs
###


def create_data(data_create_list: List[DataCreate], user_creds: User) -> List[Data]:
    """Create data objects.

    Args:
        data_create_list (List[DataCreate]): List of data objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception : Database error

    Returns:
        List[Data]: Created data objects
    """
    with DBSession() as session:
        try:
            data_db_create_list: List[DataDB] = [
                DataDB(
                    protagonist_id=user_creds.user_id,
                    **data.dict(),
                )
                for data in data_create_list
            ]
            DataDB.bulk_create(data_db_create_list, session)
            return [
                Data(data_id=obj.id, **obj.to_dict()) for obj in data_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create data: {e}")
            raise e


def get_data(query_params: DataGetQueryParams, user_creds: User) -> List[Data]:
    """Query DB for Data.

    Args:
        query_params (DataGetQueryParams): Query params from request
        user_creds (User): User credentials.

    Raises:
        Exception: database error
        e : Missing parameter

    Returns:
        List[Data]: List of Data returned from DB
    """
    stmt = ""

    if query_params.query_type == DataQueryType.GET_ALL_DATA:
        stmt = select(DataDB).where(DataDB.protagonist_id == user_creds.user_id)
    if query_params.query_type == DataQueryType.GET_DATA_BY_ID:
        if query_params.data_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "data_id"),
                ],
                model=DataGetQueryParams,
            )
            raise e
        stmt = (
            select(DataDB)
            .where(DataDB.protagonist_id == user_creds.user_id)
            .where(DataDB.id == query_params.data_id)
        )
    if query_params.query_type == DataQueryType.GET_DATA_BY_PROTAGONIST_ID:
        if query_params.protagonist_id is None:
            e = ValidationError(
                errors=[ErrorWrapper(ValueError("field required"), "protagonist_id")],
                model=DataGetQueryParams,
            )
            raise e
        stmt = select(DataDB).where(DataDB.id == user_creds.user_id)

    with DBSession() as session:
        try:
            data_list: List[DataDB] = session.execute(stmt).scalars().all()
            return [Data(data_id=obj.id, **obj.to_dict()) for obj in data_list]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch data due to {e}")
            raise e


def update_data(data_update_list: List[DataUpdate], user_creds: User) -> List[Data]:
    """Update Data in the DB from DataUpdate request.

    Args:
        data_update_list (List[DataUpdate]): List of DataUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[Data]: List of Instance of Updated Data
    """
    stmt = (
        select(DataDB)
        .where(DataDB.protagonist_id == user_creds.user_id)
        .where(DataDB.id.in_([data_update.data_id for data_update in data_update_list]))
    )
    with DBSession() as session:
        try:
            data_db_update_list: List[DataDB] = session.execute(stmt).scalars().all()
            updated_data_list = []
            for data in data_db_update_list:
                for data_update in data_update_list:
                    if data_update.data_id == data.id:
                        data_update_dict = data_update.dict(exclude_defaults=True)
                        data_update_dict.pop("data_id")
                        updated_data = data.update(session, **data_update_dict)
                        updated_data_list.append(
                            Data(data_id=updated_data.id, **updated_data.to_dict())
                        )
            return updated_data_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update data: {data.to_dict()} due to {e}")
            raise e


def delete_data(data_delete_list: List[DataDelete], user_creds: User) -> Data:
    """Delete Data in the DB from DataDelete request.

    Args:
        data_delete_list (List[DataDelete]): DataDelete request
        user_creds (User): User credentials. Defaults to None.

    Raises:
        Exception: error

    Returns:
        Data: Instance of Deleted Data
    """
    stmt = (
        select(DataDB)
        .where(DataDB.protagonist_id == user_creds.user_id)
        .where(DataDB.id.in_([data.data_id for data in data_delete_list]))
    )
    with DBSession() as session:
        try:
            data_db_delete_list: List[DataDB] = session.execute(stmt).scalars().all()
            deleted_data_list = []
            for data in data_db_delete_list:
                data.delete(session)
                deleted_data_list.append(Data(data_id=data.id, **data.to_dict()))
            return deleted_data_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete data: {data.to_dict()} due to {e}")
            raise e


###
# Flow BLoCs
###


def create_data_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: data_create_request_list
                    Prop(data=data_create_request_list, description="List of create data objects")
                2: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Created data objects

            Prop(data=created_data_list, description="List of created Data Objects")

            Prop(data=user, description="User")
    """
    try:
        data_create_request_list: List[DataCreate] = inputs[0].data
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
        created_data_list = create_data(data_create_request_list, user)
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
        Prop(data=created_data_list, description="List of created Data Objects"),
        Prop(data=user, description="User"),
    ]


def revert_data_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Revert function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: data_create_request_list
                    Prop(data=data_create_request_list, description="List of create data objects")
                1: user
                    Prop(data=user, description="User")
                2: created_data_list
                    Prop(data=created_data_list, description="List of created data objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Deleted data objects

            Prop(data=deleted_data_list, description="List of deleted Data Objects")

            Prop(data=user, description="User")
    """
    try:
        created_data_list: List[Data] = inputs[2].data
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
        deleted_data_list = delete_data(created_data_list, user)
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
        Prop(data=deleted_data_list, description="List of deleted Data Objects"),
        Prop(data=user, description="User"),
    ]


def update_data_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for updating file_id in created data object.

    Args:
        inputs (List[Prop]):
            Expects
                0: updated_file_list
                    Prop(data=created_file_list, description="List of updated file objects")
                1: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Updated data objects

            Prop(data=updated_data_list, description="List of updated Data Objects")

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

    data_update_list = []
    for file in created_file_list:
        data_update = DataUpdate(data_id=file.parent_id, file_id=file.file_id)
        data_update_list.append(data_update)

    try:
        updated_data_list = update_data(data_update_list, user)
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
        Prop(data=updated_data_list, description="List of updated Data Objects"),
        Prop(data=user, description="User"),
    ]


def rewind_data_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Backward function for updating data step.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                1: user
                    Prop(data=user, description="User")
                2: updated_data_list
                    Prop(data=updated_data_list, description="List of updated data objects")
                3: user
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
        created_file_list = inputs[0].data
        user = inputs[1].data
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
        Prop(data=created_file_list, description="List of deleted Data Objects"),
        Prop(data=user, description="User"),
    ]


def generate_create_data_flow(
    data_create_request_list: List[DataCreate], user: User
) -> Flow:
    """Generate flow for creating the data resource.

    Args:
        data_create_request_list (List[DataCreate]): List of data objects to create.
        user (User): User credentials.

    Returns:
        Flow: Create data flow
    """
    create_db_entry_step = Step(create_data_db_entry, revert_data_db_entry)
    create_file_step = Step(create_file_db_entry, revert_file_db_entry)
    create_file_presigned_url_step = Step(create_file_presigned_urls, dummy_backward)
    update_db_entry_step = Step(update_data_db_entry, rewind_data_db_entry)

    flow = Flow()

    flow.add_step(
        create_db_entry_step,
        [
            Prop(
                data=data_create_request_list,
                description="List of DataCreate Objects",
            ),
            Prop(data=user, description="User"),
        ],
    )
    create_file_step_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 0},
        description="Outputs of first step",
    )
    create_file_presigned_url_step_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 1},
        description="Outputs of second step",
    )
    update_db_entry_step_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 2},
        description="Outputs of third step",
    )
    flow.add_step(create_file_step, [create_file_step_func_prop])
    flow.add_step(
        create_file_presigned_url_step, [create_file_presigned_url_step_func_prop]
    )
    flow.add_step(update_db_entry_step, [update_db_entry_step_func_prop])

    return flow
