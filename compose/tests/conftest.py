"""Pytest config."""

from blackcap.blocs.user import create_user, delete_user
from blackcap.db import db_engine
from blackcap.models.meta.mixins import DBModel
from blackcap.schemas.api.user.delete import UserDelete
from blackcap.schemas.api.user.post import UserCreate
from blackcap.schemas.user import User
from blackcap.server import create_app
from flask import Flask
from minio.api import Minio
from minio.deleteobjects import DeleteObject

import pytest

from compose.configs import config_registry
from compose.routes import register_blueprints, register_extensions


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
    return app


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
    # delete_user(UserDelete(user_id=created_user.user_id))
