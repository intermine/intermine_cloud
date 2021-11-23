"""Auth API routes."""

from flask import Blueprint


auth_bp = Blueprint("auth", __name__, url_prefix="/v1/auth")


from compose.routes.auth.delete import delete  # noqa: F401, E402, I100
from compose.routes.auth.get import get  # noqa: F401, E402, I100
from compose.routes.auth.post import post  # noqa: F401, E402, I100
from compose.routes.auth.put import put  # noqa: F401, E402, I100
