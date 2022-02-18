"""File API POST schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import UUID4, BaseModel

from compose.schemas.file import File


class FileCreate(BaseModel):
    """File create request schema."""

    name: str
    ext: str
    file_type: str
    parent_id: UUID4
    uploaded: bool = False


class FilePOSTRequest(BaseModel):
    """File POST request schema."""

    file_list: List[FileCreate]


class FilePOSTResponse(ResponseSchema):
    """File POST response schema."""

    items: Dict[str, List[Union[File, Any]]] = {}
