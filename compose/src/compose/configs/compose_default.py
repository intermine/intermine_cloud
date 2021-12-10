"""Compose default config."""

from blackcap.configs.default import DefaultConfig
from xdg import xdg_data_home


class ComposeDefaultConfig(DefaultConfig):
    """Compose default config."""

    FLASK_APP: str = "compose"
    DEBUG: bool = True
    MINIO_ENDPOINT: str = "localhost:1402"
    MINIO_ACCESS_KEY: str = "minioaccess"
    MINIO_SECRET_KEY: str = "minioaccess"
    MINIO_SECURE: bool = False
    CLUSTER: str = "ARGO"
    DB_NAME: str = "compose"
    DB_URI: str = f"sqlite:////{xdg_data_home() / ('imcloud') / ('compose.db')}"
