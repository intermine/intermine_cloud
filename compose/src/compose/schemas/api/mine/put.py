"""Mine API PUT schema."""
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.mine import Mine


class MineUpdate(BaseModel):
    """Schema to parse update Mine requests."""

    mine_id: UUID4
    name: Optional[str]
    description: Optional[str]
    preference: Optional[str]


class MinePUTRequest(BaseModel):
    """Mine PUT request schema."""

    mine_list: List[MineUpdate]


class MinePUTResponse(ResponseSchema):
    """Mine PUT response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
