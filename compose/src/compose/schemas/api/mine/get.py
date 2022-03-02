"""Mine API GET schema."""

from enum import Enum, unique
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.mine import Mine


@unique
class MineQueryType(Enum):
    """Mine Query type enum."""

    GET_ALL_MINES = "get_all_mines"
    GET_MINE_BY_ID = "get_mine_by_id"
    GET_MINES_BY_PROTAGONIST_ID = "get_mines_by_protagonist_id"


class MineGetQueryParams(BaseModel):
    """Mine GET request query params schema."""

    query_type: MineQueryType
    mine_id: Optional[UUID4]
    protagonist_id: Optional[UUID4]


class MineGetResponse(ResponseSchema):
    """Mine GET response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
