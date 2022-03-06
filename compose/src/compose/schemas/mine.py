"""Mine schema."""

from typing import Dict, List, Optional

from pydantic import BaseModel
from pydantic.types import UUID4


class MineJobs(BaseModel):
    """Mine jobs."""

    build_id: UUID4
    deploy_id: UUID4
    undeploy_id: UUID4
    build_and_deploy_id: UUID4


class Mine(BaseModel):
    """Mine schema."""

    mine_id: UUID4
    name: str
    description: str = ""
    subdomain: str
    preference: Dict = {}
    state: Dict = {}
    mine_jobs: Optional[MineJobs]
    protagonist_id: UUID4
    rendered_template_id: UUID4
    rendered_template_file_id: UUID4
    data_file_ids: List[UUID4]
