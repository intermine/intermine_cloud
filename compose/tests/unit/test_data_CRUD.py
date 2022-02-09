"""Data model CRUD tests."""

from blackcap.schemas.user import User

from compose.blocs.data import create_data
from compose.schemas.api.data.post import DataCreate

from compose.schemas.data import Data


def test_data_create(user: User) -> None:
    created_data: Data = create_data(
        [DataCreate(name="randomDataset", ext="gff", file_type="Sequencing")], user
    )[0]
    assert created_data.name == "randomDataset"
    assert created_data.ext == "gff"
    assert created_data.file_type == "Sequencing"
