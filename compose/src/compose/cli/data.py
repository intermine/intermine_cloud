"""Data commands."""

from pathlib import Path
from shutil import make_archive
import shutil
import sys
from tempfile import TemporaryDirectory

from compose.auther import auther_registry
from compose.blocs.data import create_data, update_data
from compose.blocs.file import create_file, update_file
from compose.configs import config_registry
from compose.schemas.api.data.put import DataUpdate
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.data import Data
from compose.schemas.file import File

import click

import os

import requests

from tqdm import tqdm
from tqdm.utils import CallbackIOWrapper

config = config_registry.get_config()


def make_archive(name: str, in_path: Path, out_path: Path) -> str:
    """Create archive in a temp dir.

    Args:
        name (str): name of the archive excluding ext
        in_path (Path): dir to archive
        out_path (Path): output dir

    Returns:
        str: Path of created archive
    """
    return shutil.make_archive(out_path.joinpath("name"), "tar", in_path)


@click.command()
@click.option("--name", required=True)
@click.option("--ext", required=True)
@click.option("--file_type", required=True)
@click.option("--endpoint", default=config.MINIO_ENDPOINT)
@click.option("--access_key", default=config.MINIO_ACCESS_KEY)
@click.option("--access_secret", default=config.MINIO_SECRET_KEY)
@click.argument("path")
def create(name, ext, file_type, endpoint, access_key, access_secret, path) -> None:
    """Create data object."""
    # Check Authorization
    user_access_token = config.USER_ACCESS_TOKEN
    auther = auther_registry.get_auther(config.AUTHER)
    try:
        user = auther.extract_user_from_token(user_access_token)
    except Exception as e:
        click.secho(f"Authorization failed\n\n Exiting....")
        sys.exit(1)

    # Create archive of the data in a temp dir
    with TemporaryDirectory() as tempd:
        click.secho(f"Created temporary dir at: {Path(tempd).absolute()}")
        archive_path = make_archive(name, path, Path(tempd))
        click.secho(f"Archive created at: {Path(archive_path).absolute()}")
        # Create a data in the db
        data = Data(name=name, ext=ext, file_type=file_type)
        try:
            created_data = create_data([data], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        # Create file in db
        file = File(
            name=name, ext=ext, file_type=file_type, parent_id=created_data.data_id
        )
        try:
            created_file = create_file([file], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        # Update data in db to link with file
        data_update = DataUpdate(
            data_id=created_data.data_id, file_id=created_file.file_id
        )
        try:
            updated_data = update_data(data_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        # Upload file
        archive_file_size = os.stat(archive_path).st_size
        try:
            with open(archive_path, "rb") as f:
                with tqdm(
                    total=archive_file_size,
                    unit="B",
                    unit_scale=True,
                    unit_divisor=1024,
                ) as t:
                    wrapped_file = CallbackIOWrapper(t.update, f, "read")
                    requests.put(
                        url=created_file.presigned_url,
                        data=wrapped_file,
                    )
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        # Update file status to uploaded in db
        file_update = FileUpdate(file_id=created_file.file_id, uploaded=True)
        try:
            update_file(file_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)


@click.command()
@click.option("--id")
@click.argument("path")
def update(id, path) -> None:
    """Update data object."""
    # Create archive of the data in a temp dir
    make_archive()

    # fetch the data from the db

    # Create file in db

    # Update data in db

    # Upload file

    # Update file status to uploaded in db


@click.command()
@click.option("--id")
@click.argument("path")
def get(id, path) -> None:
    """Get data object."""
    # fetch the data from the db

    # Download file in a temp dir

    # Unpack archive


@click.group()
def data() -> None:
    """Data commands."""
    pass


data.add_command(create)
