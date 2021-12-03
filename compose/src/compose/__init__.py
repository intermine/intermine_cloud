"""Compose."""

from importlib.metadata import PackageNotFoundError, version  # type: ignore

from compose import configs  # noqa: F401
from compose import models  # noqa: F401

try:
    __version__ = version(__name__)
except PackageNotFoundError:  # pragma: no cover
    __version__ = "unknown"
