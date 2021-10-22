"""File API DELETE schema."""

from typing import List, Optional

from compose.schemas.file import File
from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class FileDelete(BaseModel):
    """File delete Schema."""

    file_id: UUID4


class FileDELETEResponse(BaseModel):
    """File DELETE response schema."""

    items: List[FileDelete] = []


class FileDELETERequest(BaseModel):
    """File DELETE request schema."""

    files: List[FileDelete]
    user: Optional[User]
