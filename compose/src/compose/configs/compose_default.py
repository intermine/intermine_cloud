"""Compose default config."""

from blackcap.configs.default import DefaultConfig


class ComposeDefaultConfig(DefaultConfig):
    """Compose default config."""

    MINIO_ENDPOINT: str = "localhost:1402"
    MINIO_ACCESS_KEY: str = "minioaccess"
    MINIO_SECRET_KEY: str = "minioaccess"
