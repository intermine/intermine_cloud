"""Template API PUT schema."""
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import Template, TemplateVar


class TemplateUpdate(BaseModel):
    """Schema to parse update Template requests."""

    template_id: UUID4
    name: Optional[str]
    description: Optional[str]
    template_vars: Optional[List[TemplateVar]]
    file_id: Optional[UUID4]


class TemplatePUTRequest(BaseModel):
    """Template PUT request schema."""

    template_list: List[TemplateUpdate]


class TemplatePOSTResponse(ResponseSchema):
    """Template POST response schema."""

    items: Dict[str, List[Union[Template, Any]]] = {}
