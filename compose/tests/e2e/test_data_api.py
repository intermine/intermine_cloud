"""Data API tests."""

from typing import Dict
from flask import Flask

from compose.schemas.api.data.post import DataCreate, DataPOSTRequest


def test_data_api_post(app: Flask, cookies: Dict) -> None:
    data_post_request = DataPOSTRequest(
        data_list=[
            DataCreate(name="randomDatasetAPI", ext="gff", file_type="Sequencing")
        ]
    )

    # Add cookies
    for cookie in cookies:
        app.cookie_jar.set_cookie(cookie)

    response = app.post("/v1/data/", json=data_post_request.dict())
    assert response.status_code == 200
