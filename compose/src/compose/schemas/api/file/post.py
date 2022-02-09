"""File API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import UUID4, BaseModel

from compose.schemas.file import File


class FilePOSTResponse(ResponseSchema):
    """File POST response schema."""

    items: List[File] = []


class FileCreate(BaseModel):
    """File create request schema."""

    name: str
    ext: Optional[str]
    file_type: str
    parent_id: UUID4
    uploaded: bool = False


class FilePOSTRequest(BaseModel):
    """File POST request schema."""

    files: List[File]
    user: Optional[User]
