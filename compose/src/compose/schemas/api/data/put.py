"""Data API PUT schema."""
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.data import Data


class DataUpdate(BaseModel):
    """Schema to parse update Data requests."""

    data_id: UUID4
    name: Optional[str]
    file_id: Optional[UUID4]
    metainfo: Optional[Dict]


class DataPUTRequest(BaseModel):
    """Data PUT request schema."""

    data_list: List[DataUpdate]


class DataPUTResponse(ResponseSchema):
    """Data PUT response schema."""

    items: Dict[str, List[Union[Data, Any]]] = {}
