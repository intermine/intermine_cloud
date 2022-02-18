"""Template API GET schema."""

from enum import Enum, unique
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import Template


@unique
class TemplateQueryType(Enum):
    """Template Query type enum."""

    GET_ALL_TEMPLATES = "get_all_templates"
    GET_TEMPLATE_BY_ID = "get_template_by_id"
    GET_TEMPLATES_BY_PROTAGONIST_ID = "get_templates_by_protagonist_id"


class TemplateGetQueryParams(BaseModel):
    """Template GET request query params schema."""

    query_type: TemplateQueryType
    template_id: Optional[UUID4]
    file_id: Optional[UUID4]
    protagonist_id: Optional[UUID4]


class TemplateGetResponse(ResponseSchema):
    """Template GET response schema."""

    items: Dict[str, List[Union[Template, Any]]] = {}
