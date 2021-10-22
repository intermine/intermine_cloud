"""Template API POST schema."""

from typing import List, Optional

from compose.schemas.template import Template
from blackcap.schemas.user import User

from pydantic import BaseModel


class TemplatePOSTResponse(BaseModel):
    """Template POST response schema."""

    items: List[Template] = []


class TemplatePOSTRequest(BaseModel):
    """Template POST request schema."""

    templates: List[Template]
    user: Optional[User]
