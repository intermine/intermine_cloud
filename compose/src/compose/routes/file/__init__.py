"""File API routes."""

from flask import Blueprint


file_bp = Blueprint("file", __name__, url_prefix="/v1/file")


from compose.routes.file.get import get  # noqa: F401, E402, I100
from compose.routes.file.put import put  # noqa: F401, E402, I100
