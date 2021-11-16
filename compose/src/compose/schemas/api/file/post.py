"""File API POST schema."""

from typing import List, Optional

from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.file import File


class FilePOSTResponse(BaseModel):
    """File POST response schema."""

    items: List[File] = []


class FilePOSTRequest(BaseModel):
    """File POST request schema."""

    files: List[File]
    user: Optional[User]
