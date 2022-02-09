"""Mine API routes."""

from flask import Blueprint


mine_bp = Blueprint("mine", __name__, url_prefix="/v1/mine")


# from compose.routes.mine.delete import delete  # noqa: F401, E402, I100
from compose.routes.mine.get import get  # noqa: F401, E402, I100
from compose.routes.mine.post import post  # noqa: F401, E402, I100
from compose.routes.mine.action import mine_action_bp  # noqa: F401, E402, I100

# from compose.routes.mine.put import put  # noqa: F401, E402, I100

mine_bp.register_blueprint(mine_action_bp)
