"""Template API tests."""

from typing import Dict
from flask import Flask

from compose.schemas.api.template.post import TemplateCreate, TemplatePOSTRequest


def test_template_api_post(app: Flask, cookies: Dict) -> None:
    template_post_request = TemplatePOSTRequest(
        template_list=[TemplateCreate(name="randomTemplateAPI", template_vars=[])]
    )

    # Add cookies
    for cookie in cookies:
        app.cookie_jar.set_cookie(cookie)

    response = app.post("/v1/template/", json=template_post_request.dict())
    assert response.status_code == 200
