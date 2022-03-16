"""Data API POST schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel

from compose.schemas.data import Data


class DataCreate(BaseModel):
    """Data create schema."""

    name: str
    ext: str
    file_type: str
    metadata: Dict = {}


class DataPOSTRequest(BaseModel):
    """Data POST request schema."""

    data_list: List[DataCreate]


class DataPOSTResponse(ResponseSchema):
    """Data POST response schema."""

    items: Dict[str, List[Union[Data, Any]]] = {}
