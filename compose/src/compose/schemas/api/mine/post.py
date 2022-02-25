"""Mine API POST schema."""

from typing import Any, Dict, List, Union


from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel

from compose.schemas.mine import Mine


class MineCreate(BaseModel):
    """MineCreate schema."""


class MinePOSTRequest(BaseModel):
    """Mine POST request schema."""

    mine_list: List[MineCreate]


class MinePOSTResponse(ResponseSchema):
    """Mine POST response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
