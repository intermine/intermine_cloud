"""Demon."""

from importlib.metadata import PackageNotFoundError, version  # type: ignore

from demon import configs, cluster  # noqa: F401

try:
    __version__ = version(__name__)
except PackageNotFoundError:  # pragma: no cover
    __version__ = "unknown"
