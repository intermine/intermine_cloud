"""File API DELETE schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.file import File


class FileDelete(BaseModel):
    """File delete Schema."""

    file_id: UUID4


class FileDELETERequest(BaseModel):
    """File DELETE request schema."""

    file_list: List[FileDelete]


class FileDELETEResponse(ResponseSchema):
    """File DELETE response schema."""

    items: Dict[str, List[Union[File, Any]]] = {}
