"""Template API POST schema."""

from typing import List, Optional

from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.template import RenderedTemplate


class RenderedTemplatePOSTResponse(BaseModel):
    """RenderedTemplate POST response schema."""

    items: List[RenderedTemplate] = []


class RenderedTemplatePOSTRequest(BaseModel):
    """RenderedTemplate POST request schema."""

    rendered_templates: List[RenderedTemplate]
    user: Optional[User]
