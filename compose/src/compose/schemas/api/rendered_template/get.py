"""RenderedTemplate API GET schema."""

from enum import Enum, unique
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import RenderedTemplate


@unique
class RenderedTemplateQueryType(Enum):
    """RenderedTemplate Query type enum."""

    GET_ALL_RENDERED_TEMPLATES = "get_all_rendered_templates"
    GET_RENDERED_TEMPLATE_BY_ID = "get_rendered_template_by_id"
    GET_RENDERED_TEMPLATES_BY_PROTAGONIST_ID = (
        "get_rendered_templates_by_protagonist_id"
    )


class RenderedTemplateGetQueryParams(BaseModel):
    """RenderedTemplate GET request query params schema."""

    query_type: RenderedTemplateQueryType
    template_id: Optional[UUID4]
    protagonist_id: Optional[UUID4]


class RenderedTemplateGetResponse(ResponseSchema):
    """RenderedTemplate GET response schema."""

    items: Dict[str, List[Union[RenderedTemplate, Any]]] = {}
