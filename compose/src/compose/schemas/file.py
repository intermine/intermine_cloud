""""File schema."""

from typing import Dict, Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class File(BaseModel):
    """File schema."""

    file_id: Optional[UUID4]
    name: str
    ext: Optional[str]
    file_type: str
    parent_id: UUID4
    presigned_post: Optional[str]
    presigned_form: Optional[Dict]
    uploaded: bool = False
