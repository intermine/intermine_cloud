"""Template API DELETE schema."""

from typing import List, Optional

from blackcap.schemas.api.common import ResponseSchema
from blackcap.schemas.user import User
from pydantic import BaseModel
from pydantic.types import UUID4


class TemplateDelete(BaseModel):
    """Template delete Schema."""

    template_id: UUID4


class TemplateDELETEResponse(ResponseSchema):
    """Template DELETE response schema."""

    items: List[TemplateDelete] = []


class TemplateDELETERequest(BaseModel):
    """Template DELETE request schema."""

    templates: List[TemplateDelete]
    user: Optional[User]
