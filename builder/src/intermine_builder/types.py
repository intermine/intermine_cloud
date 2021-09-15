from typing import List, TypedDict


class DataSource(TypedDict):
    """Dict representation of a project.xml data source entry."""
    name: str
    type: str
    properties: List[dict]
