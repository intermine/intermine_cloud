"""File API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.file import File


class FilePOSTResponse(ResponseSchema):
    """File POST response schema."""

    items: List[File] = []


class FilePOSTRequest(BaseModel):
    """File POST request schema."""

    files: List[File]
    user: Optional[User]
