"""RenderedTemplate API DELETE schema."""

from typing import List, Optional

from blackcap.schemas.user import User

from pydantic import BaseModel
from pydantic.types import UUID4


class RenderedTemplateDelete(BaseModel):
    """RenderedTemplate delete Schema."""

    rendered_template_id: UUID4


class RenderedTemplateDELETEResponse(BaseModel):
    """RenderedTemplate DELETE response schema."""

    items: List[RenderedTemplateDelete] = []


class RenderedTemplateDELETERequest(BaseModel):
    """RenderedTemplate DELETE request schema."""

    rendered_templates: List[RenderedTemplateDelete]
    user: Optional[User]
