"""Mine API tests."""

from typing import Dict
from flask import Flask

from compose.schemas.api.mine.post import MineCreate, MinePOSTRequest
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.schemas.template import Template


def test_mine_api_post(
    app: Flask,
    cookies: Dict,
    data: Data,
    template: Template,
    data_file: File,
    template_file: File,
) -> None:
    mine_post_request = MinePOSTRequest(
        mine_list=[
            MineCreate(
                name="randomMine",
                description="Random Mine",
                subdomain="random",
                template_id=template.template_id,
                data_file_ids=[str(data.data_id)],
            )
        ]
    )

    # Add cookies
    for cookie in cookies:
        app.cookie_jar.set_cookie(cookie)

    response = app.post("/v1/mine/", json=mine_post_request.dict())
    assert response.status_code == 200
