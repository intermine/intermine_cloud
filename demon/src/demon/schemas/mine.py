"""Mine schema."""

from typing import Dict, List, Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class Mine(BaseModel):
    """Mine schema."""

    mine_id: Optional[UUID4]
    name: str
    description: Optional[str]
    preference: Dict = {}
    state: Dict = {}
    protagonist_id: Optional[UUID4]
    rendered_template_file_id: Optional[UUID4]
    data_file_ids: Optional[List[str]]
