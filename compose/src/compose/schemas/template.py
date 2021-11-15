""""Template schema."""

from typing import Any, List, Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class TemplateContext(BaseModel):
    """Template context schema."""

    pass


class TemplateVar(BaseModel):
    """Template vars schema"""

    name: str
    var_type: str
    description: Optional[str]


class Template(BaseModel):
    """Template schema."""

    template_id: Optional[UUID4]
    name: str
    description: Optional[str]
    template_vars: List[TemplateVar]
    latest_file_id: Optional[UUID4]


class RenderedTemplate(BaseModel):
    """RenderedTemplate schema."""

    rendered_template_id: Optional[UUID4]
    name: str
    description: Optional[str]
    template_vars: List[TemplateVar]
    template_context: Optional[TemplateContext]
    parent_mine_id: Optional[UUID4]
    file_id: Optional[UUID4]
