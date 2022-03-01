"""File model CRUD tests."""

from blackcap.schemas.user import User

from compose.blocs.file import update_file
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.file import File


def test_file_update(user: User, file: File) -> None:
    updated_file: File = update_file([FileUpdate(file_id=file.file_id)], user)[0]
    assert updated_file.file_id == file.file_id
