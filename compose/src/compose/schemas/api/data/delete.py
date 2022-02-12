"""Data API DELETE schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel
from pydantic.types import UUID4


class DataDelete(BaseModel):
    """Data delete Schema."""

    data_id: UUID4


class DataDELETEResponse(ResponseSchema):
    """Data DELETE response schema."""

    items: List[DataDelete] = []


class DataDELETERequest(BaseModel):
    """Data DELETE request schema."""

    data_list: List[DataDelete]
    user: Optional[User]
