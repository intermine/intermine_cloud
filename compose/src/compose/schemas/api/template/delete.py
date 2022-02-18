"""Template API DELETE schema."""

from typing import Any, Dict, List, Union

from blackcap.schemas.api.common import ResponseSchema
from pydantic import BaseModel
from pydantic.types import UUID4

from compose.schemas.template import Template


class TemplateDelete(BaseModel):
    """Template delete Schema."""

    template_id: UUID4


class TemplateDELETERequest(BaseModel):
    """Template DELETE request schema."""

    template_list: List[TemplateDelete]


class TemplateDELETEResponse(ResponseSchema):
    """Template DELETE response schema."""

    items: Dict[str, List[Union[Template, Any]]] = {}
