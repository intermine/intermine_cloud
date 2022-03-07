"""Mine Flows tests."""

from blackcap.flow import Executor, FlowStatus
from blackcap.schemas.user import User

from compose.blocs.mine import generate_create_mine_flow
from compose.schemas.api.mine.post import MineCreate
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.schemas.template import Template


def test_create_mine_flow(
    user: User, data: Data, template: Template, data_file: File, template_file: File
) -> None:
    mine_create_request_list = [
        MineCreate(
            name="randomMine",
            description="Random Mine",
            subdomain="random",
            template_id=template.template_id,
            data_file_ids=[str(data.data_id)],
        )
    ]
    create_mine_flow = generate_create_mine_flow(mine_create_request_list, user)
    executor = Executor(create_mine_flow, {})
    executed_flow = executor.run()
    assert executed_flow.status == FlowStatus.PASSED