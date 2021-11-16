"""Data API GET schema."""

from enum import Enum, unique
from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.data import Data


class DataGetResponse(ResponseSchema):
    """Data GET response schema."""

    items: List[Data] = []


@unique
class DataQueryType(Enum):
    """Data Query type enum."""

    GET_ALL_DATA = "get_all_data"
    GET_DATA_BY_ID = "get_data_by_id"
    GET_DATA_BY_PROTAGONIST_ID = "get_data_by_protagonist_id"


class DataGetQueryParams(BaseModel):
    """Data GET request query params schema."""

    query_type: DataQueryType
    data_id: Optional[UUID4]
    protagonist_id: Optional[UUID4]
