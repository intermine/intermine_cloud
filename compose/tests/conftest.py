"""Pytest config."""

from typing import Dict
from uuid import uuid4

from blackcap.blocs.user import create_user
from blackcap.db import db_engine
from blackcap.models.meta.mixins import DBModel
from blackcap.schemas.api.user.post import UserCreate
from blackcap.schemas.user import User
from blackcap.server import create_app
from flask import Flask
from minio.api import Minio
from minio.deleteobjects import DeleteObject
import pytest

from compose.blocs.file import create_file
from compose.configs import config_registry
from compose.routes import register_blueprints, register_extensions
from compose.schemas.api.auth.post import AuthPOSTRequest
from compose.schemas.api.file.post import FileCreate
from compose.schemas.file import File

config = config_registry.get_config()

minio_client = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=config.MINIO_SECURE,
)


@pytest.fixture(scope="session")
def app() -> Flask:
    app = create_app(config, register_extensions, register_blueprints)
    app.testing = True
    return app.test_client()


@pytest.fixture(scope="session", autouse=True)
def reset_database() -> None:
    DBModel.metadata.drop_all(db_engine)
    DBModel.metadata.create_all(db_engine)


@pytest.fixture(scope="session")
def user() -> User:
    user_create = UserCreate(  # noqa: S106
        user=User(name="randomName", email="rand@random.com", organisation="RandomOrg"),
        password="password",
    )
    created_user = create_user([user_create])[0]
    minio_client.make_bucket(f"protagonist-{created_user.user_id}")
    yield created_user
    delete_object_list = map(
        lambda x: DeleteObject(x.object_name),
        minio_client.list_objects(
            f"protagonist-{created_user.user_id}", recursive=True
        ),
    )
    minio_client.remove_objects(
        f"protagonist-{created_user.user_id}", delete_object_list
    )
    minio_client.remove_bucket(f"protagonist-{created_user.user_id}")


@pytest.fixture(scope="session")
def file(user: User) -> File:
    file_create = FileCreate(
        name="testFile", ext="gff", file_type="sequencing", parent_id=uuid4()
    )
    created_file = create_file([file_create], user)[0]
    return created_file


@pytest.fixture(scope="session")
def cookies(user: User, app: Flask) -> Dict:
    user_login = AuthPOSTRequest(email=user.email, password="password")  # noqa: S106
    app.post("/v1/auth/", json=user_login.dict())
    cookie_list = [cookie for cookie in app.cookie_jar]
    # remove cookies from test client
    app.cookie_jar.clear()
    return cookie_list
