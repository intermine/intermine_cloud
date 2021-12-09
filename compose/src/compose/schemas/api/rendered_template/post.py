"""Template API POST schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.template import RenderedTemplate


class RenderedTemplatePOSTResponse(ResponseSchema):
    """RenderedTemplate POST response schema."""

    items: List[RenderedTemplate] = []


class RenderedTemplatePOSTRequest(BaseModel):
    """RenderedTemplate POST request schema."""

    rendered_templates: List[RenderedTemplate]
    user: Optional[User]
