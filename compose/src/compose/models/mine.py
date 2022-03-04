"""MineDB model."""

from blackcap.models.meta.mixins import DBModel, SurrogatePKUUID, TimestampMixin
from blackcap.models.meta.orm import reference_col
from sqlalchemy import Column, JSON, String


class MineDB(DBModel, SurrogatePKUUID, TimestampMixin):
    """Mine table."""

    __tablename__ = "mine"
    name = Column(String, nullable=False)
    description = Column(String)
    subdomain = Column(String, unique=True)
    preference = Column(JSON, nullable=False)
    state = Column(JSON, nullable=False)
    protagonist_id = reference_col("protagonist")
    rendered_template_file_id = reference_col("file")
    data_file_ids = Column(JSON)
    mine_jobs = Column(JSON)
