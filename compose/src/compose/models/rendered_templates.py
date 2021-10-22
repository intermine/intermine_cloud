"""RenderedTemplateDB model"""

from blackcap.models.meta.mixins import DBModel, SurrogatePKUUID, TimestampMixin
from blackcap.models.meta.orm import reference_col

from sqlalchemy import Column, String, JSON


class RenderedTemplateDB(DBModel, SurrogatePKUUID, TimestampMixin):
    """RenderedTemplate table."""

    __tablename__ = "rendered_template"
    name = Column(String, nullable=False)
    description = Column(String)
    template_vars = Column(JSON)
    template_context = Column(JSON)
    parent_mine_id = reference_col("mine")
    file_id = reference_col("file")
    protagonist_id = reference_col("protagonist")
