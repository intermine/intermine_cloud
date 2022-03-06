"""Mine BLoCs."""

from typing import List

from blackcap.db import DBSession
from blackcap.flow import Flow, FlowExecError, FuncProp, get_outer_function, Prop, Step
from blackcap.flow.step import dummy_backward
from blackcap.schemas.user import User
from compose.blocs.rendered_template import (
    create_rendered_template_db_entry,
    render_and_upload_rendered_template,
    revert_rendered_template_db_entry,
    rewind_rendered_template_db_entry,
    update_rendered_template_db_entry,
)
from logzero import logger
from pydantic import ValidationError
from pydantic.error_wrappers import ErrorWrapper
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError


from compose.blocs.data import get_data
from compose.blocs.file import (
    create_file_db_entry,
    create_file_presigned_urls,
    get_file,
    revert_file_db_entry,
)
from compose.blocs.template import get_template
from compose.models.mine import MineDB
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.mine.delete import MineDelete
from compose.schemas.api.mine.get import MineGetQueryParams, MineQueryType
from compose.schemas.api.mine.post import MineCreate
from compose.schemas.api.mine.put import MineUpdate
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import RenderedTemplate, Template


######################
# CRUD BloCs
######################


def create_mine(mine_list: List[MineCreate], user_creds: User) -> List[Mine]:
    """Create mine objects.

    Args:
        mine_list (List[MineCreate]): List of mine objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception: Database error

    Returns:
        List[Mine]: Created mine objects
    """
    with DBSession() as session:
        try:
            mine_db_create_list: List[MineDB] = [
                MineDB(
                    protagonist_id=user_creds.user_id,
                    **mine.dict(exclude={"template_id"}),
                )
                for mine in mine_list
            ]
            MineDB.bulk_create(mine_db_create_list, session)
            return [
                Mine(mine_id=obj.id, **obj.to_dict()) for obj in mine_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create mine: {e}")
            raise e


def get_mine(query_params: MineGetQueryParams, user_creds: User) -> List[Mine]:
    """Query DB for Mines.

    Args:
        query_params (MineGetQueryParams): Query params from request
        user_creds (User): User credentials.


    Raises:
        Exception: error
        e: error

    Returns:
        List[Mine]: List of Mines returned from DB
    """
    stmt = ""

    if query_params.query_type == MineQueryType.GET_ALL_MINES:
        stmt = select(MineDB).where(MineDB.protagonist_id == user_creds.user_id)
    if query_params.query_type == MineQueryType.GET_MINE_BY_ID:
        if query_params.mine_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "mine_id"),
                ],
                model=MineGetQueryParams,
            )
            raise e
        stmt = (
            select(MineDB)
            .where(MineDB.protagonist_id == user_creds.user_id)
            .where(MineDB.id == query_params.mine_id)
        )
    if query_params.query_type == MineQueryType.GET_MINES_BY_PROTAGONIST_ID:
        if query_params.protagonist_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "protagonist_id"),
                ],
                model=MineGetQueryParams,
            )
            raise e
        stmt = select(MineDB).where(MineDB.id == user_creds.user_id)

    with DBSession() as session:
        try:
            mine_list: List[MineDB] = session.execute(stmt).scalars().all()
            return [Mine(mine_id=obj.id, **obj.to_dict()) for obj in mine_list]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch mine due to {e}")
            raise e


def update_mine(mine_update_list: List[MineUpdate], user_creds: User) -> List[Mine]:
    """Update Mine in the DB from MineUpdate request.

    Args:
        mine_update_list (List[MineUpdate]): List of MineUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[Mine]: List of Instance of Updated Mine
    """
    stmt = (
        select(MineDB)
        .where(MineDB.protagonist_id == user_creds.user_id)
        .where(MineDB.id.in_([mine_update.mine_id for mine_update in mine_update_list]))
    )
    with DBSession() as session:
        try:
            mine_db_update_list: List[MineDB] = session.execute(stmt).scalars().all()
            updated_mine_list = []
            for mine in mine_db_update_list:
                for mine_update in mine_update_list:
                    if mine_update.mine_id == mine.id:
                        mine_update_dict = mine_update.dict(exclude_defaults=True)
                        mine_update_dict.pop("mine_id")
                        updated_mine = mine.update(session, **mine_update_dict)
                        updated_mine_list.append(
                            Mine(mine_id=updated_mine.id, **updated_mine.to_dict())
                        )
            return updated_mine_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update mine: {mine.to_dict()} due to {e}")
            raise e


def delete_mine(mine_delete_list: List[MineDelete], user_creds: User) -> List[Mine]:
    """Delete Mine in the DB from MineDelete request.

    Args:
        mine_delete_list (List[MineDelete]): List of MineDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[Mine]: List of Instance of Deleted Mine
    """
    stmt = (
        select(MineDB)
        .where(MineDB.protagonist_id == user_creds.user_id)
        .where(MineDB.id.in_([mine.mine_id for mine in mine_delete_list]))
    )
    with DBSession() as session:
        try:
            mine_db_delete_list: List[MineDB] = session.execute(stmt).scalars().all()
            deleted_mine_list = []
            for mine in mine_db_delete_list:
                mine.delete(session)
                deleted_mine_list.append(Mine(mine_id=mine.id, **mine.to_dict()))
            return deleted_mine_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete mine: {mine.to_dict()} due to {e}")
            raise e


######################
# Flow BloCs
######################


def check_data_list_exist(inputs: List[Prop]) -> List[Prop]:
    """Check data list exist step.

    Args:
        inputs (List[Prop]):
            Expects
                0: data_list
                    Prop(data=data_ids, description="List of ids of data objects")
                2: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:

            Prop(data=data_ids, description="List of Data Objects ids")

            Prop(data=file_list, description="List of File Objects")

            Prop(data=user, description="User")
    """
    try:
        data_ids: List[str] = inputs[0].data
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
        # Check data list existence
        data_query = DataGetQueryParams(query_type=DataQueryType.GET_ALL_DATA)
        data_list: List[Data] = get_data(data_query, user)
        data_list_ids = [str(data.data_id) for data in data_list]
        # Use sets to optimize later
        for data_id in data_ids:
            if data_id not in data_list_ids:
                # Raise a user descriptive error later
                raise Exception("DATASET NOT FOUND")

        # Check for uploaded files
        file_query = FileGetQueryParams(query_type=FileQueryType.GET_ALL_FILES)
        file_list: List[File] = get_file(file_query, user)
        file_list_parent_ids = [
            file.parent_id for file in file_list if file.uploaded is True
        ]
        for data_id in data_ids:
            if data_id not in file_list_parent_ids:
                # Raise a user descriptive error later
                raise Exception("DATASET NOT UPLOADED")

    except SQLAlchemyError as e:
        raise FlowExecError(
            human_description="Querying DB object failed",
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
        Prop(data=data_list, description="List of Data Objects"),
        Prop(data=file_list, description="List of File Objects"),
        Prop(data=user, description="User"),
    ]


def check_template_list_exist(inputs: List[Prop]) -> List[Prop]:
    """Check data list exist step.

    Args:
        inputs (List[Prop]):
            Expects
                0: template_ids
                    Prop(data=template_ids, description="template object ids")
                2: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:

            Prop(data=template_list, description="List of Template Objects")
            Prop(data=file_list, description="List of File Objects")
            Prop(data=user, description="User")
    """
    try:
        template_ids: List[str] = inputs[0].data
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
        # Check template list existence
        template_query = TemplateGetQueryParams(
            query_type=TemplateQueryType.GET_ALL_TEMPLATES
        )
        template_list: List[Template] = get_template(template_query, user)
        template_list_ids = [str(template.template_id) for template in template_list]
        # Use sets to optimize later
        for template_id in template_ids:
            if template_id not in template_list_ids:
                # Raise a user descriptive error later
                raise Exception("TEMPLATE NOT FOUND")

        # Check for uploaded files
        file_query = FileGetQueryParams(query_type=FileQueryType.GET_ALL_FILES)
        file_list: List[File] = get_file(file_query, user)
        file_list_parent_ids = [
            file.parent_id for file in file_list if file.uploaded is True
        ]
        for template_id in template_ids:
            if template_id not in file_list_parent_ids:
                # Raise a user descriptive error later
                raise Exception("TEMPLATE NOT UPLOADED")
    except SQLAlchemyError as e:
        raise FlowExecError(
            human_description="Querying DB object failed",
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
        Prop(data=template_list, description="List of Template Objects"),
        Prop(data=file_list, description="List of File Objects"),
        Prop(data=user, description="User"),
    ]


def create_mine_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: mine_create_request_list
                    Prop(data=mine_create_request_list, description="List of create mine objects")
                1: created_rendered_template_list
                    Prop(data=created_rendered_template_list, description="List of create rendered_template objects")
                2: user
                    Prop(data=user, description="User")


    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Created mine objects

            Prop(data=created_mine_list, description="List of created mine Objects")

            Prop(data=user, description="User")
    """
    try:
        mine_create_request_list: List[MineCreate] = inputs[0].data
        created_rendered_template_list: List[RenderedTemplate] = inputs[1].data
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
        for mine in mine_create_request_list:
            for rendered_template in created_rendered_template_list:
                if mine.template_id == rendered_template.parent_template_id:
                    mine.rendered_template_id = rendered_template.rendered_template_id
                    mine.rendered_template_file_id = rendered_template.file_id
        created_mine_list = create_mine(mine_create_request_list, user)
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
        Prop(data=created_mine_list, description="List of created Mine Objects"),
        Prop(data=user, description="User"),
    ]


def revert_mine_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Revert function for create db entry step.

    Args:
        inputs (List[Prop]):
            Expects
                0: mine_create_request_list
                    Prop(data=data_create_request_list, description="List of create data objects")
                1: user
                    Prop(data=user, description="User")
                2: created_mine_list
                    Prop(data=created_mine_list, description="List of created mine objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Deleted mine objects

            Prop(data=deleted_mine_list, description="List of deleted Mine Objects")

            Prop(data=user, description="User")
    """
    try:
        created_mine_list: List[Mine] = inputs[2].data
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
        deleted_mine_list = delete_mine(created_mine_list, user)
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
        Prop(data=deleted_mine_list, description="List of deleted Mine Objects"),
        Prop(data=user, description="User"),
    ]


def generate_create_mine_flow(
    mine_create_request_list: List[MineCreate], user: User
) -> Flow:
    """Generate flow for creating the mine resource.

    Args:
        mine_create_request_list (List[MineCreate]): List of mine objects to create.
        user (User): User credentials.

    Returns:
        Flow: Create data flow
    """
    check_data_list_exist_step = Step(check_data_list_exist, dummy_backward)
    check_template_list_exist_step = Step(check_template_list_exist, dummy_backward)
    create_rendered_template_db_entry_step = Step(
        create_rendered_template_db_entry, revert_rendered_template_db_entry
    )
    create_file_db_entry_step = Step(create_file_db_entry, revert_file_db_entry)
    create_file_presigned_url_step = Step(create_file_presigned_urls, dummy_backward)
    render_and_upload_rendered_template_step = Step(
        render_and_upload_rendered_template, dummy_backward
    )
    create_mine_db_entry_step = Step(create_mine_db_entry, revert_mine_db_entry)
    update_rendered_template_step = Step(
        update_rendered_template_db_entry, rewind_rendered_template_db_entry
    )

    flow = Flow()

    # * 0: Check data list
    mine_data_ids = [
        data_id for mine in mine_create_request_list for data_id in mine.data_file_ids
    ]
    flow.add_step(
        check_data_list_exist_step,
        [Prop(data=mine_data_ids, description="List of data ids")],
    )

    # * 1: Check template list
    mine_template_ids = [mine.template_id for mine in mine_create_request_list]
    flow.add_step(
        check_template_list_exist_step,
        [Prop(data=mine_template_ids, description="List of template ids")],
    )

    # * 2: Create render template db entry
    checked_template_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 1},
        description="checked template list and user props",
    )
    flow.add_step(
        create_rendered_template_db_entry_step, [checked_template_list_func_prop]
    )

    # * 3: Create file entry for rendered template
    created_rendered_template_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 2},
        description="created rendred template list and user props",
    )
    flow.add_step(
        create_file_db_entry_step,
        [created_rendered_template_list_func_prop],
    )

    # * 4: Create file presigned urls for rendered template
    created_file_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 3},
        description="created file list and user props",
    )
    flow.add_step(
        create_file_presigned_url_step,
        [created_file_list_func_prop],
    )

    # * 6: Render and upload template
    presigned_file_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 4},
        description="presigned file list and user props",
    )
    flow.add_step(
        render_and_upload_rendered_template_step,
        [
            created_rendered_template_list_func_prop,
            presigned_file_list_func_prop,
            checked_template_list_func_prop,
        ],
    )

    # * 7: Create mine db entry
    flow.add_step(
        create_mine_db_entry_step,
        [
            Prop(
                data=mine_create_request_list,
                description="List of DataCreate Objects",
            ),
            Prop(data=user, description="User"),
        ],
    )

    # * 8: Update rendered template db entry
    created_mine_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 7},
        description="created mine list and user props",
    )
    flow.add_step(
        update_rendered_template_step,
        [
            created_mine_list_func_prop,
            created_file_list_func_prop,
        ],
    )

    return flow
