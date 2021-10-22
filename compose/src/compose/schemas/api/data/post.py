"""Data API POST schema."""

from typing import List, Optional

from compose.schemas.data import Data
from blackcap.schemas.user import User

from pydantic import BaseModel


class DataPOSTResponse(BaseModel):
    """Data POST response schema."""

    items: List[Data] = []


class DataPOSTRequest(BaseModel):
    """Data POST request schema."""

    data: List[Data]
    user: Optional[User]
