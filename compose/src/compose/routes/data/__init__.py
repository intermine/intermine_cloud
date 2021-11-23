"""Data API routes."""

from flask import Blueprint


data_bp = Blueprint("data", __name__, url_prefix="/v1/data")


# from compose.routes.data.delete import delete  # noqa: F401, E402, I100
from compose.routes.data.get import get  # noqa: F401, E402, I100
from compose.routes.data.post import post  # noqa: F401, E402, I100

# from compose.routes.data.put import put  # noqa: F401, E402, I100
