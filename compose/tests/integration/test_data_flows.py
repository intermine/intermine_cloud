"""Data Flows tests."""

from blackcap.flow import Executor, FlowStatus


from compose.blocs.data import generate_create_data_flow
from compose.schemas.api.data.post import DataCreate


def test_create_data_flow(user) -> None:
    data_create_request_list = [
        DataCreate(name="randomFlowDataset", ext="gff", file_type="Sequencing")
    ]
    create_data_flow = generate_create_data_flow(data_create_request_list, user)
    executor = Executor(create_data_flow, {})
    executed_flow = executor.run()
    assert executed_flow.status == FlowStatus.PASSED
