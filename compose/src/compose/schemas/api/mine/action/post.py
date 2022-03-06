"""Mine Action API POST schema."""

from typing import Any, Dict, List, Union
from enum import Enum, unique


from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel, UUID4

from compose.schemas.mine import Mine


@unique
class MineActionType(Enum):
    """Mine Action type enum."""

    BUILD = "build"
    BUILD_AND_DEPLOY = "build_and_deploy"


class MineActionCreate(BaseModel):
    """MineActionCreate schema."""

    mine_id: UUID4
    action: MineActionType


class MineActionPOSTRequest(BaseModel):
    """MineAction POST request schema."""

    mine_action_list: List[MineActionCreate]


class MineActionPOSTResponse(ResponseSchema):
    """Mine Action POST response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
