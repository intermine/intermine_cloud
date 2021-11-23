"""User API routes."""

from flask import Blueprint


user_bp = Blueprint("user", __name__, url_prefix="/v1/user")


from compose.routes.user.delete import delete  # noqa: F401, E402, I100
from compose.routes.user.get import get  # noqa: F401, E402, I100
from compose.routes.user.post import post  # noqa: F401, E402, I100
from compose.routes.user.put import put  # noqa: F401, E402, I100
