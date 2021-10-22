"""Mine API POST schema."""

from typing import List, Optional

from compose.schemas.mine import Mine
from blackcap.schemas.user import User

from pydantic import BaseModel


class MinePOSTResponse(BaseModel):
    """Mine POST response schema."""

    items: List[Mine] = []


class MinePOSTRequest(BaseModel):
    """Mine POST request schema."""

    mines: List[Mine]
    user: Optional[User]
