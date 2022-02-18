"""Template schema."""

from typing import List, Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class TemplateContext(BaseModel):
    """Template context schema."""

    pass


class TemplateVar(BaseModel):
    """Template vars schema."""

    name: str
    var_type: str
    description: Optional[str]


class Template(BaseModel):
    """Template schema."""

    template_id: UUID4
    name: str
    description: str = ""
    template_vars: List[TemplateVar]
    file_id: Optional[UUID4]

    def get_id(self: "Template") -> UUID4:
        """Return object id."""
        return self.template_id

    @property
    def ext(self: "Template") -> str:
        """Return Extension of file."""
        return "zip"

    @property
    def file_type(self: "Template") -> str:
        """Return File type of file."""
        return "template"


class RenderedTemplate(BaseModel):
    """RenderedTemplate schema."""

    rendered_template_id: Optional[UUID4]
    name: str
    description: Optional[str]
    template_vars: List[TemplateVar]
    template_context: Optional[TemplateContext]
    parent_mine_id: Optional[UUID4]
    file_id: Optional[UUID4]

    @property
    def ext(self: "RenderedTemplate") -> str:
        """Return Extension of file."""
        return "zip"

    @property
    def file_type(self: "RenderedTemplate") -> str:
        """Return File type of file."""
        return "template"

    def get_id(self: "RenderedTemplate") -> UUID4:
        """Return object id."""
        return self.rendered_template_id
