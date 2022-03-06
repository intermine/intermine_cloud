"""RenderedTemplate API PUT schema."""
from typing import Any, Dict, List, Optional, Union

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import RenderedTemplate


class RenderedTemplateUpdate(BaseModel):
    """Schema to parse update RenderedTemplate requests."""

    rendered_template_id: UUID4
    name: Optional[str]
    parent_mine_id: Optional[UUID4]
    file_id: Optional[UUID4]


class RenderedTemplatePUTRequest(BaseModel):
    """RenderedTemplate PUT request schema."""

    rendered_template_list: List[RenderedTemplateUpdate]


class RenderedTemplatePUTResponse(ResponseSchema):
    """RenderedTemplate PUT response schema."""

    items: Dict[str, List[Union[RenderedTemplate, Any]]] = {}
