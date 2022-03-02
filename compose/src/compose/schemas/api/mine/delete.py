"""Mine API DELETE schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.mine import Mine


class MineDelete(BaseModel):
    """Mine delete Schema."""

    mine_id: UUID4


class MineDELETERequest(BaseModel):
    """Mine DELETE request schema."""

    mine_list: List[MineDelete]


class MineDELETEResponse(ResponseSchema):
    """Mine DELETE response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
