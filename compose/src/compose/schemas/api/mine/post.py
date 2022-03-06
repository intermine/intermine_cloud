"""Mine API POST schema."""

from typing import Any, Dict, List, Union, Optional


from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel, UUID4

from compose.schemas.mine import Mine


class MineCreate(BaseModel):
    """MineCreate schema."""

    name: str
    description: str = ""
    subdomain: str
    preference: Dict = {}
    state: Dict = {}
    template_id: UUID4
    rendered_template_id: Optional[UUID4]
    rendered_template_file_id: Optional[UUID4]
    data_file_ids: List[str]


class MinePOSTRequest(BaseModel):
    """Mine POST request schema."""

    mine_list: List[MineCreate]


class MinePOSTResponse(ResponseSchema):
    """Mine POST response schema."""

    items: Dict[str, List[Union[Mine, Any]]] = {}
