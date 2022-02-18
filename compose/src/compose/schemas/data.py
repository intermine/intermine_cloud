"""Data schema."""

from typing import Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class Data(BaseModel):
    """Data schema."""

    data_id: Optional[UUID4]
    name: str
    ext: str
    file_type: str
    file_id: Optional[UUID4]

    def get_id(self: "Data") -> UUID4:
        """Return object id."""
        return self.data_id
