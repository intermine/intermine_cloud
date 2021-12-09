"""Template API routes."""

from flask import Blueprint


template_bp = Blueprint("template", __name__, url_prefix="/v1/template")


# from compose.routes.template.delete import delete  # noqa: F401, E402, I100
from compose.routes.template.get import get  # noqa: F401, E402, I100
from compose.routes.template.post import post  # noqa: F401, E402, I100

# from compose.routes.template.put import put  # noqa: F401, E402, I100
