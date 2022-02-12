"""Data API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.data import Data


class DataPOSTResponse(ResponseSchema):
    """Data POST response schema."""

    items: List[Data] = []


class DataCreate(BaseModel):
    """Data create schema."""

    name: str
    ext: str
    file_type: str


class DataPOSTRequest(BaseModel):
    """Data POST request schema."""

    data_list: List[DataCreate]
    user: Optional[User]
