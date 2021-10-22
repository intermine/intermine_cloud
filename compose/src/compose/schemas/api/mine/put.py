"""Mine API PUT schema."""
from typing import List, Optional

from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class MineUpdate(BaseModel):
    """Schema to parse update Mine requests."""

    mine_id: UUID4
    name: Optional[str]


class MinePUTRequest(BaseModel):
    """Mine PUT request schema."""

    mines: List[MineUpdate]
    user: Optional[User]
