"""Template Flows tests."""

from blackcap.flow import Executor, FlowStatus


from compose.blocs.template import generate_create_template_flow
from compose.schemas.api.template.post import TemplateCreate


def test_create_template_flow(user) -> None:
    template_create_request_list = [
        TemplateCreate(name="randomFlowTemplate", template_vars=[])
    ]
    create_template_flow = generate_create_template_flow(
        template_create_request_list, user
    )
    executor = Executor(create_template_flow, {})
    executed_flow = executor.run()
    assert executed_flow.status == FlowStatus.PASSED
