"""TemplaeDB model."""

from blackcap.models.meta.mixins import DBModel, SurrogatePKUUID, TimestampMixin
from blackcap.models.meta.orm import reference_col
from sqlalchemy import Column, JSON, String


class TemplateDB(DBModel, SurrogatePKUUID, TimestampMixin):
    """Template table."""

    __tablename__ = "template"
    name = Column(String, nullable=False)
    description = Column(String)
    template_vars = Column(JSON)
    latest_file_id = reference_col("file", nullable=True)
    protagonist_id = reference_col("protagonist")
