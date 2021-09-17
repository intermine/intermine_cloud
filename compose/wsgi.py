"""WSGI interface."""

from blackcap.configs import config_registry
from blackcap.server import create_app, register_blueprints, register_extensions

from flask.app import Flask


config = config_registry.get_config()


def compose_register_blueprints(app: Flask) -> None:
    """Register blueprints."""

    register_blueprints(app)


def compose_register_extensions(app: Flask) -> None:
    """Register extensions."""

    register_extensions(app)


app = create_app(
    config=config,
    register_ext=compose_register_extensions,
    register_bp=compose_register_blueprints,
)
