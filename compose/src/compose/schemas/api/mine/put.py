"""Mine API PUT schema."""
from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
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

    mines: List[MineUpdate]
    user: Optional[User]


class MinePUTResponse(ResponseSchema):
    """Mine PUT response schema."""

    items: List[Mine] = []
