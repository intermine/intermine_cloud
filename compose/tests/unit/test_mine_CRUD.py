"""Mine CRUD tests."""

from blackcap.schemas.user import User

from compose.blocs.mine import create_mine
from compose.schemas.api.mine.post import MineCreate
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import RenderedTemplate, Template


def test_mine_create(
    user: User,
    data: Data,
    template: Template,
    rendered_template: RenderedTemplate,
    file: File,
) -> None:
    created_mine: Mine = create_mine(
        [
            MineCreate(
                name="randomMine",
                description="Random Mine",
                subdomain="random",
                template_id=template.template_id,
                rendered_template_id=rendered_template.rendered_template_id,
                rendered_template_file_id=file.file_id,
                data_file_ids=[str(data.data_id)],
            )
        ],
        user,
    )[0]
    assert created_mine.name == "randomMine"
    assert created_mine.description == "Random Mine"
    assert created_mine.subdomain == "random"
