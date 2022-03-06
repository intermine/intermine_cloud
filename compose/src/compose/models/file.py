"""FileDB model."""

from blackcap.models.meta.helpers import GUID
from blackcap.models.meta.mixins import DBModel, SurrogatePKUUID, TimestampMixin
from blackcap.models.meta.orm import reference_col
from sqlalchemy import Boolean, Column, String


class FileDB(DBModel, SurrogatePKUUID, TimestampMixin):
    """File table."""

    __tablename__ = "file"
    name = Column(String, nullable=False)
    ext = Column(String)
    file_type = Column(String, nullable=False)
    uploaded = Column(Boolean, nullable=False)
    parent_id = Column(GUID, nullable=False)
    parent_template_id = Column(GUID, nullable=False)
    protagonist_id = reference_col("protagonist")
