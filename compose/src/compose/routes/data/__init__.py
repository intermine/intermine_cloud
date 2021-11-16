"""Data API routes."""

from flask import Blueprint


data_bp = Blueprint("data", __name__, url_prefix="/v1/data")


from compose.routes.data.get import get  # noqa: F401, E402, I100
from compose.routes.data.post import post_data  # noqa: F401, E402, I100
