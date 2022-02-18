"""Template model CRUD tests."""

from blackcap.schemas.user import User

from compose.blocs.template import create_template
from compose.schemas.api.template.post import TemplateCreate
from compose.schemas.template import Template


def test_template_create(user: User) -> None:
    created_template: Template = create_template(
        [
            TemplateCreate(
                name="randomTemplate", description="Random Template", template_vars=[]
            )
        ],
        user,
    )[0]
    assert created_template.name == "randomTemplate"
    assert created_template.description == "Random Template"
