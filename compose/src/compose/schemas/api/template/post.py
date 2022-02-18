"""Template API POST schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel

from compose.schemas.template import Template, TemplateVar


class TemplateCreate(BaseModel):
    """Template create schema."""

    name: str
    description: str = ""
    template_vars: List[TemplateVar]


class TemplatePOSTRequest(BaseModel):
    """Template POST request schema."""

    template_list: List[TemplateCreate]


class TemplatePOSTResponse(ResponseSchema):
    """Template POST response schema."""

    items: Dict[str, List[Union[Template, Any]]] = {}
