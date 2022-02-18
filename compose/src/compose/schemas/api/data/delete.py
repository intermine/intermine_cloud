"""Data API DELETE schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.data import Data


class DataDelete(BaseModel):
    """Data delete Schema."""

    data_id: UUID4


class DataDELETERequest(BaseModel):
    """Data DELETE request schema."""

    data_list: List[DataDelete]


class DataDELETEResponse(ResponseSchema):
    """Data DELETE response schema."""

    items: Dict[str, List[Union[Data, Any]]] = {}
