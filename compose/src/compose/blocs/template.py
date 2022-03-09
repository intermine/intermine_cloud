"""Template BLoCs."""

from typing import List, Optional

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
from compose.models.template import TemplateDB
from compose.schemas.api.template.delete import TemplateDelete
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.api.template.post import TemplateCreate
from compose.schemas.api.template.put import TemplateUpdate
from compose.schemas.file import File
from compose.schemas.template import Template

###
# CRUD BLoCs
###


def create_template(
    template_create_list: List[TemplateCreate], user_creds: User
) -> List[Template]:
    """Create template objects.

    Args:
        template_create_list (List[TemplateCreate]): List of template objects to create.
        user_creds (User): User credentials.

    Raises:
        Exception: database error

    Returns:
        List[Template]: Created template objects
    """
    with DBSession() as session:
        try:
            template_db_create_list: List[TemplateDB] = [
                TemplateDB(
                    protagonist_id=user_creds.user_id,
                    **template.dict(),
                )
                for template in template_create_list
            ]
            TemplateDB.bulk_create(template_db_create_list, session)
            return [
                Template(template_id=obj.id, **obj.to_dict())
                for obj in template_db_create_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to create templates: {e}")
            raise e


def get_template(
    query_params: TemplateGetQueryParams, user_creds: User
) -> List[Template]:
    """Query DB for Templates.

    Args:
        query_params (TemplateGetQueryParams): Query params from request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[Template]: List of Templates returned from DB
    """
    stmt = ""

    if query_params.query_type == TemplateQueryType.GET_ALL_TEMPLATES:
        stmt = select(TemplateDB).where(TemplateDB.protagonist_id == user_creds.user_id)
    if query_params.query_type == TemplateQueryType.GET_TEMPLATE_BY_ID:
        if query_params.data_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "template_id"),
                ],
                model=TemplateGetQueryParams,
            )
            raise e
        stmt = (
            select(TemplateDB)
            .where(TemplateDB.protagonist_id == user_creds.user_id)
            .where(TemplateDB.id == query_params.template_id)
        )
    if query_params.query_type == TemplateQueryType.GET_TEMPLATES_BY_PROTAGONIST_ID:
        if query_params.data_id is None:
            e = ValidationError(
                errors=[
                    ErrorWrapper(ValueError("field required"), "protagonist_id"),
                ],
                model=TemplateGetQueryParams,
            )
            raise e
        stmt = select(TemplateDB).where(TemplateDB.id == user_creds.user_id)

    with DBSession() as session:
        try:
            template_db_list: List[TemplateDB] = session.execute(stmt).scalars().all()
            template_list: List[Template] = [
                Template(template_id=obj.id, **obj.to_dict())
                for obj in template_db_list
            ]
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to fetch templates due to {e}")
            raise e

    return template_list


def update_template(
    template_update_list: List[TemplateUpdate], user_creds: User
) -> List[Template]:
    """Update Template in the DB from TemplateUpdate request.

    Args:
        template_update_list (List[TemplateUpdate]): List of TemplateUpdate request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        List[Template]: List of Instance of Updated Template
    """
    stmt = (
        select(TemplateDB)
        .where(TemplateDB.protagonist_id == user_creds.user_id)
        .where(
            TemplateDB.id.in_(
                [
                    template_update.template_id
                    for template_update in template_update_list
                ]
            )
        )
    )
    with DBSession() as session:
        try:
            template_db_update_list: List[TemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            updated_template_list = []
            for template in template_db_update_list:
                for template_update in template_update_list:
                    if template_update.template_id == template.id:
                        template_update_dict = template_update.dict(
                            exclude_defaults=True
                        )
                        template_update_dict.pop("template_id")
                        updated_template = template.update(
                            session, **template_update_dict
                        )
                        updated_template_list.append(
                            Template(
                                template_id=updated_template.id,
                                **updated_template.to_dict(),
                            )
                        )
            return updated_template_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to update template: {template.to_dict()} due to {e}")
            raise e


def delete_template(
    template_delete_list: List[TemplateDelete], user_creds: User
) -> Template:
    """Delete template in the DB from TemplateDelete request.

    Args:
        template_delete_list (List[TemplateDelete]): List of TemplateDelete request
        user_creds (User): User credentials.

    Raises:
        Exception: error

    Returns:
        Template: Instance of Deleted Template
    """
    stmt = (
        select(TemplateDB)
        .where(TemplateDB.protagonist_id == user_creds.user_id)
        .where(
            TemplateDB.id.in_(
                [template.template_id for template in template_delete_list]
            )
        )
    )
    with DBSession() as session:
        try:
            template_db_delete_list: List[TemplateDB] = (
                session.execute(stmt).scalars().all()
            )
            deleted_template_list = []
            for template in template_db_delete_list:
                template.delete(session)
                deleted_template_list.append(
                    Template(template_id=template.id, **template.to_dict())
                )
            return deleted_template_list
        except Exception as e:
            session.rollback()
            logger.error(f"Unable to delete template: {template.to_dict()} due to {e}")
            raise e


###
# Flow BLoCs
###


def create_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Create template db entry step function.

    Args:
        inputs (List[Prop]):
            Expects
                0: template_create_request_list
                    Prop(data=template_create_request_list, description="List of create template objects")
                2: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Created template objects

            Prop(data=created_template_list, description="List of created Template Objects")

            Prop(data=user, description="User")
    """
    try:
        template_create_request_list: List[TemplateCreate] = inputs[0].data
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
        created_template_list = create_template(template_create_request_list, user)
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
            data=created_template_list, description="List of created Template Objects"
        ),
        Prop(data=user, description="User"),
    ]


def revert_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Delete db entry step function.

    Args:
        inputs (List[Prop]):
            Expects
                0: template_create_request_list
                    Prop(data=template_create_request_list, description="List of create template objects")
                1: user
                    Prop(data=user, description="User")
                2: created_template_list
                    Prop(data=created_data_list, description="List of created template objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Deleted data objects

            Prop(data=deleted_template_list, description="List of deleted Template Objects")

            Prop(data=user, description="User")
    """
    try:
        created_template_list: List[Template] = inputs[2].data
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
        deleted_template_list = delete_template(created_template_list, user)
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
            data=deleted_template_list, description="List of deleted template Objects"
        ),
        Prop(data=user, description="User"),
    ]


def update_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Forward function for updating file_id in created template object.

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
            Updated template objects

            Prop(data=updated_template_list, description="List of updated template Objects")

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

    template_update_list = []
    for file in created_file_list:
        template_update = TemplateUpdate(
            template_id=file.parent_id, file_id=file.file_id
        )
        template_update_list.append(template_update)

    try:
        updated_template_list = update_template(template_update_list, user)
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
            data=updated_template_list, description="List of updated template Objects"
        ),
        Prop(data=user, description="User"),
    ]


def rewind_template_db_entry(inputs: List[Prop]) -> List[Prop]:
    """Backward function for updating template step.

    Args:
        inputs (List[Prop]):
            Expects
                0: created_file_list
                    Prop(data=created_file_list, description="List of created file objects")
                1: user
                    Prop(data=user, description="User")
                2: updated_template_list
                    Prop(data=updated_template_list, description="List of updated template objects")
                3: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:
            Reverted template objects

            Prop(data=reverted_template_list, description="List of reverted template Objects")

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
        Prop(data=created_file_list, description="List of reverted template Objects"),
        Prop(data=user, description="User"),
    ]


def generate_create_template_flow(
    template_create_request_list: List[TemplateCreate], user: User
) -> Flow:
    """Generate flow for creating the template resource.

    Args:
        template_create_request_list (List[TemplateCreate]): List of template objects to create.
        user (User): User credentials.

    Returns:
        Flow: Create data flow
    """
    create_db_entry_step = Step(create_template_db_entry, revert_template_db_entry)
    create_file_step = Step(create_file_db_entry, revert_file_db_entry)
    create_file_presigned_url_step = Step(create_file_presigned_urls, dummy_backward)
    update_db_entry_step = Step(update_template_db_entry, rewind_template_db_entry)

    flow = Flow()

    flow.add_step(
        create_db_entry_step,
        [
            Prop(
                data=template_create_request_list,
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
