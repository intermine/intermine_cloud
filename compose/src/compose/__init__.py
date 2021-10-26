"""Compose."""

from importlib.metadata import PackageNotFoundError, version  # type: ignore

from compose import configs

try:
    __version__ = version(__name__)
except PackageNotFoundError:  # pragma: no cover
    __version__ = "unknown"
