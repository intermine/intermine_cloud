"""Data API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.data import Data


class DataPOSTResponse(ResponseSchema):
    """Data POST response schema."""

    items: List[Data] = []


class DataPOSTRequest(BaseModel):
    """Data POST request schema."""

    data: List[Data]
    user: Optional[User]
