"""File API GET schema."""

from enum import Enum, unique
from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from compose.schemas.file import File

from pydantic import BaseModel


class FileGetResponse(ResponseSchema):
    """File GET response schema."""

    items: List[File] = []


@unique
class FileQueryType(Enum):
    """File Query type enum."""

    GET_ALL_FILES = "get_all_files"
    GET_FILE_BY_ID = "get_file_by_id"
    GET_FILES_BY_PROTAGONIST_ID = "get_files_by_protagonist_id"


class FileGetQueryParams(BaseModel):
    """File GET request query params schema."""

    query_type: FileQueryType
    file_id: Optional[str]
    protagonist_id: Optional[str]
