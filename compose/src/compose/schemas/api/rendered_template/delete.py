"""RenderedTemplate API DELETE schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import RenderedTemplate


class RenderedTemplateDelete(BaseModel):
    """RenderedTemplate delete Schema."""

    rendered_template_id: UUID4


class RenderedTemplateDELETERequest(BaseModel):
    """RenderedTemplate DELETE request schema."""

    rendered_templates_list: List[RenderedTemplateDelete]


class RenderedTemplateDELETEResponse(ResponseSchema):
    """RenderedTemplate DELETE response schema."""

    items: Dict[str, List[Union[RenderedTemplate, Any]]] = {}
