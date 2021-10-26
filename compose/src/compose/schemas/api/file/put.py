"""File API PUT schema."""
from typing import List, Optional

from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class FileUpdate(BaseModel):
    """Schema to parse update File requests."""

    file_id: UUID4
    name: Optional[str]
    uploaded: Optional[bool]


class FilePUTRequest(BaseModel):
    """File PUT request schema."""

    file: List[FileUpdate]
    user: Optional[User]
