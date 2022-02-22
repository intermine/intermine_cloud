"""File API PUT schema."""
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.file import File


class FileUpdate(BaseModel):
    """Schema to parse update File requests."""

    file_id: UUID4
    name: Optional[str]
    uploaded: Optional[bool]


class FilePUTRequest(BaseModel):
    """File PUT request schema."""

    file_list: Dict[str, List[Union[File, Any]]] = {}


class FilePUTResponse(ResponseSchema):
    """File PUT response schema."""

    items: Dict[str, List[Union[File, Any]]] = {}
