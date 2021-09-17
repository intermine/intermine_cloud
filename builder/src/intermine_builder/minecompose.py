import os
from typing import Dict, List
from pydantic import BaseModel


class DataSource(BaseModel):
    name: str
    type: str
    properties: List[dict]


class MinePreset(BaseModel):
    preset: str
    mine: str
    properties: Dict[str, str]
    datasources: List[DataSource]


class MineCompose(MinePreset):
    # union of MinePreset ... plus more in the future
    pass


def parse_minecompose(minecompose_path: os.PathLike) -> MineCompose:
    """Parse and validate a minecompose.json.

    Args:
        minecompose_path: Path to minecompose.json file.

    Returns:
        MineCompose pydantic model.
    """
    mc = MineCompose.parse_file(minecompose_path, content_type="application/json")

    return mc
