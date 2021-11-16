"""WSGI interface."""

# !WARN: DO NOT change import order
# It is required that compose config initializes early
from compose.configs import config_registry

from blackcap.server import create_app

from compose.routes import register_blueprints, register_extensions

config = config_registry.get_config()


app = create_app(
    config=config,
    register_ext=register_extensions,
    register_bp=register_blueprints,
)

if __name__ == "__main__":
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
    )
