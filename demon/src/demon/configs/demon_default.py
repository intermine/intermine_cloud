"""Demon default config."""

from blackcap.configs.default import DefaultConfig
from xdg import xdg_data_home


class DemonDefaultConfig(DefaultConfig):
    """Demon default config."""

    FLASK_APP: str = "demon"
    DEBUG: bool = True
    MINIO_ENDPOINT: str = "localhost:1402"
    MINIO_ACCESS_KEY: str = "minioaccess"
    MINIO_SECRET_KEY: str = "minioaccess"
    MINIO_SECURE: bool = False
    DB_NAME: str = "demon"
    DB_URI: str = f"sqlite:////{xdg_data_home() / ('imcloud') / ('demon.db')}"
    MESSENGER: str = "NATS"
    NATS_ENDPOINT: str = "nats://0.0.0.0:4222"
