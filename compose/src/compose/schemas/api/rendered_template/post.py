"""Template API POST schema."""

from typing import Any, Dict, List, Union, Optional

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel, UUID4

from compose.schemas.template import RenderedTemplate, TemplateContext, TemplateVar


class RenderedTemplateCreate(BaseModel):
    """Rendered Template create schema."""

    name: str
    description: str = ""
    template_vars: List[TemplateVar] = []
    template_context: TemplateContext = TemplateContext()
    parent_mine_id: Optional[UUID4]
    parent_template_id: UUID4
    file_id: Optional[UUID4]


class RenderedTemplatePOSTRequest(BaseModel):
    """RenderedTemplate POST request schema."""

    rendered_templates_list: List[RenderedTemplateCreate]


class RenderedTemplatePOSTResponse(ResponseSchema):
    """RenderedTemplate POST response schema."""

    items: Dict[str, List[Union[RenderedTemplate, Any]]] = {}
