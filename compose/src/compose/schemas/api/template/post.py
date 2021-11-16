"""Template API POST schema."""

from typing import List, Optional

from blackcap.schemas.user import User
from pydantic import BaseModel

from compose.schemas.template import Template


class TemplatePOSTResponse(BaseModel):
    """Template POST response schema."""

    items: List[Template] = []


class TemplatePOSTRequest(BaseModel):
    """Template POST request schema."""

    templates: List[Template]
    user: Optional[User]
