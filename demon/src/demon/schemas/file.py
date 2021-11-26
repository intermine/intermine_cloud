"""File schema."""

from typing import Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class File(BaseModel):
    """File schema."""

    file_id: Optional[UUID4]
    name: str
    ext: Optional[str]
    file_type: str
    parent_id: UUID4
    presigned_url: Optional[str]
    uploaded: bool = False
