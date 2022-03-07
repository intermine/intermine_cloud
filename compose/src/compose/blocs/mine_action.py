"""Mine action blocs."""

from typing import List

from blackcap.flow import Flow, FlowExecError, FuncProp, get_outer_function, Prop, Step
from blackcap.flow.step import dummy_backward
from blackcap.schemas.user import User

from compose.schemas.api.mine.action.post import MineActionCreate

###
# Flow BLoCs
###


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

    check_mine_list_step = Step({}, dummy_backward)
    create_job_db_entry_step = Step()
    create_schedule_db_entry_step = Step()
    publish_schedule_msg_step = Step({}, dummy_backward)
    update_mine_db_entry_step = Step()

    flow = Flow()

    # * 0: Check mine existence
    flow.add_step(
        check_mine_list_step,
        [
            Prop(
                data=mine_action_create_request_list,
                description="List of mine action create objects",
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
    flow.add_step(publish_schedule_msg_step, [created_schedule_list_func_prop])

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
