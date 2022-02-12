"""Data API PUT schema."""
from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.data import Data


class DataUpdate(BaseModel):
    """Schema to parse update Data requests."""

    data_id: UUID4
    name: Optional[str]
    file_id: Optional[UUID4]


class DataPUTRequest(BaseModel):
    """Data PUT request schema."""

    data_list: List[DataUpdate]
    user: Optional[User]


class DataPUTResponse(ResponseSchema):
    """Data PUT response schema."""

    items: List[Data] = []
