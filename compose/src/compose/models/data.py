"""DataDB model."""

from blackcap.models.meta.mixins import DBModel, SurrogatePKUUID, TimestampMixin
from blackcap.models.meta.orm import reference_col
from sqlalchemy import Column, String


class DataDB(DBModel, SurrogatePKUUID, TimestampMixin):
    """Data table."""

    __tablename__ = "data"
    name = Column(String, nullable=False)
    ext = Column(String)
    file_type = Column(String, nullable=False)
    file_id = reference_col("file", nullable=True)
    protagonist_id = reference_col("protagonist")
