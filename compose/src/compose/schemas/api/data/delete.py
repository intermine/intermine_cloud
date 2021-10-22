"""Data API DELETE schema."""

from typing import List, Optional

from compose.schemas.data import Data
from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class DataDelete(BaseModel):
    """Data delete Schema."""

    data_id: UUID4


class DataDELETEResponse(BaseModel):
    """Data DELETE response schema."""

    items: List[DataDelete] = []


class DataDELETERequest(BaseModel):
    """Data DELETE request schema."""

    data: List[DataDelete]
    user: Optional[User]
