"""Mine API DELETE schema."""

from typing import List, Optional

from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class MineDelete(BaseModel):
    """Mine delete Schema."""

    mine_id: UUID4


class MineDELETEResponse(BaseModel):
    """Mine DELETE response schema."""

    items: List[MineDelete] = []


class MineDELETERequest(BaseModel):
    """Mine DELETE request schema."""

    mines: List[MineDelete]
    user: Optional[User]
