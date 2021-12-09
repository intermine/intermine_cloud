"""Mine API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.mine import Mine


class MinePOSTResponse(ResponseSchema):
    """Mine POST response schema."""

    items: List[Mine] = []


class MinePOSTRequest(BaseModel):
    """Mine POST request schema."""

    mines: List[Mine]
    user: Optional[User]
