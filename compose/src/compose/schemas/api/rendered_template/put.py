"""RenderedTemplate API PUT schema."""
from typing import List, Optional

from blackcap.schemas.user import User


from pydantic import BaseModel
from pydantic.types import UUID4


class RenderedTemplateUpdate(BaseModel):
    """Schema to parse update RenderedTemplate requests."""

    rendered_template_id: UUID4
    name: Optional[str]
    status: Optional[str]


class RenderedTemplatePUTRequest(BaseModel):
    """RenderedTemplate PUT request schema."""

    rendered_templates: List[RenderedTemplateUpdate]
    user: Optional[User]
