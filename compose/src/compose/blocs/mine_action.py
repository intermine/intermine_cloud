"""Mine action blocs."""

from typing import List

from blackcap.blocs.schedule import create_schedule_with_scheduler, create_schedule_db_entry, revert_schedule_db_entry, publish_schedule_message
from blackcap.flow import Flow, FlowExecError, FuncProp, get_outer_function, Prop, Step
from blackcap.flow.step import dummy_backward
from blackcap.schemas.user import User
from sqlalchemy.exc import SQLAlchemyError

from compose.blocs.mine import get_mine, update_mine_db_entry, rewind_mine_db_entry
from compose.schemas.api.mine.action.post import MineActionCreate
from compose.schemas.api.mine.get import Mine, MineGetQueryParams, MineQueryType

###
# Flow BLoCs
###


def check_mine_list_exist(inputs: List[Prop]) -> List[Prop]:
    """Check data list exist step.

    Args:
        inputs (List[Prop]):
            Expects
                0: mine_id_list
                    Prop(data=mine_id_list, description="List of ids of mine objects")
                1: user
                    Prop(data=user, description="User")

    Raises:
        FlowExecError: Flow execution failed

    Returns:
        List[Prop]:

            Prop(data=mine_list, description="List of Mine Objects ids")

            Prop(data=user, description="User")
    """
    try:
        mine_id_list: List[str] = inputs[0].data
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
        # Check mine list existence
        mine_query = MineGetQueryParams(query_type=MineQueryType.GET_ALL_MINE)
        mine_list: List[Mine] = get_mine(mine_query, user)
        mine_list_ids = [str(mine.mine_id) for mine in mine_list]
        # Use sets to optimize later
        for mine_id in mine_id_list:
            if mine_id not in mine_list_ids:
                # Raise a user descriptive error later
                raise Exception("MINE NOT FOUND")

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
        Prop(data=mine_list, description="List of Mine Objects"),
        Prop(data=user, description="User"),
    ]


def generate_create_mine_action_flow(
    mine_action_create_request_list: List[MineActionCreate], user: User
) -> Flow:
    """Generate flow for creating the mine resource.

    Args:
        mine_action_create_request_list (List[MineActionCreate]): List of mine action to create.
        user (User): User credentials.

    Returns:
        Flow: Create data flow
    """
    check_mine_list_step = Step(check_mine_list_exist, dummy_backward)
    create_job_db_entry_step = Step()
    create_schedule_with_scheduler_step = Step(
        create_schedule_with_scheduler, dummy_backward
    )
    create_schedule_db_entry_step = Step(create_schedule_db_entry, revert_schedule_db_entry)
    publish_schedule_message_step = Step(publish_schedule_message, dummy_backward)
    update_mine_db_entry_step = Step(update_mine_db_entry, rewind_mine_db_entry)

    flow = Flow()

    # * 0: Check mine existence
    mine_id_list = [mine.mine_id for mine in mine_action_create_request_list]
    flow.add_step(
        check_mine_list_step,
        [
            Prop(
                data=mine_id_list,
                description="List of mine ids",
            ),
            Prop(data=user, description="User credentials"),
        ],
    )

    # * 1: Create mine job db entry
    job_create_request_list = []
    flow.add_step(
        create_job_db_entry_step,
        [
            Prop(
                data=job_create_request_list,
                description="List of job create objects",
            ),
            Prop(data=user, description="User credentials"),
        ],
    )
    
    # * 2: Process schedule create objects
    schedule_create_list = []
    created_job_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 1},
        description="List of created job objects",
    )
    flow.add_step(create_schedule_db_entry_step, [created_job_list_func_prop])

    # * 2: Create schedule db entry
    created_job_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 1},
        description="List of created job objects",
    )
    flow.add_step(create_schedule_db_entry_step, [created_job_list_func_prop])

    # * 2: Publish schedule msg
    created_schedule_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 2},
        description="List of created schedule objects",
    )
    flow.add_step(publish_schedule_message_step, [created_schedule_list_func_prop])

    # * 4: Update mine with job details
    checked_mine_list_func_prop = FuncProp(
        func=flow.get_froward_output,
        params={"index": 0},
        description="List of checked mine objects",
    )
    flow.add_step(
        update_mine_db_entry_step,
        [checked_mine_list_func_prop, created_job_list_func_prop],
    )

    return flow
