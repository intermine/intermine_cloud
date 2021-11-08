""""Data schema."""

from typing import Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class Data(BaseModel):
    """Data schema."""

    data_id: Optional[UUID4]
    name: str
    ext: str
    file_type: str
    file_id: Optional[UUID4]
