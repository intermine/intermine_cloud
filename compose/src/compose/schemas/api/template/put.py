"""Template API PUT schema."""
from typing import List, Optional

from blackcap.schemas.user import User
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import TemplateVar


class TemplateUpdate(BaseModel):
    """Schema to parse update Template requests."""

    template_id: UUID4
    name: Optional[str]
    template_vars: Optional[List[TemplateVar]]
    status: Optional[str]
    latest_file_id: Optional[UUID4]


class TemplatePUTRequest(BaseModel):
    """Template PUT request schema."""

    templates: List[TemplateUpdate]
    user: Optional[User]
