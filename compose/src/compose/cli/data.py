"""Data commands."""

from pathlib import Path
from pprint import pformat
from shutil import make_archive
import shutil
import sys
from tempfile import TemporaryDirectory

from compose.blocs.data import create_data, update_data, get_data
from compose.blocs.file import create_file, update_file, get_file
from compose.configs import config_registry
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.data.put import DataUpdate
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.data import Data
from compose.schemas.file import File
from compose.utils.auth import check_auth

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
    return shutil.make_archive(out_path.joinpath(name), "tar", in_path)


@click.command()
@click.option("--name", required=True)
@click.option("--ext", required=True)
@click.option("--file_type", required=True)
@click.argument("path")
def create(name, ext, file_type, path) -> None:
    """Create data object."""
    # Check Authorization
    user = check_auth(config)

    # Create archive of the data in a temp dir
    with TemporaryDirectory() as tempd:
        click.echo(
            click.style("\nCreated temporary dir at: ", fg="green")
            + f"{Path(tempd).absolute()}"
        )
        archive_path = make_archive(name, path, Path(tempd))
        click.secho(
            click.style("Archive created at: ", fg="green")
            + f"{Path(archive_path).absolute()}\n"
        )
        # Create a data in the db
        data = Data(name=name, ext=ext, file_type=file_type)
        try:
            created_data = create_data([data], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Data object created:", fg="green")
            + f"\n\n{pformat(created_data.dict())}\n"
        )

        # Create file in db
        file = File(
            name=name, ext=ext, file_type=file_type, parent_id=created_data.data_id
        )
        try:
            created_file = create_file([file], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("File object created:", fg="green")
            + f"\n\n{pformat(created_file.dict())}\n"
        )

        # Update data in db to link with file
        data_update = DataUpdate(
            data_id=created_data.data_id, file_id=created_file.file_id
        )
        try:
            updated_data = update_data(data_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Data and file linked:", fg="green")
            + f"\n\n{pformat(updated_data.dict())}\n"
        )

        # Upload file
        click.secho(f"Starting file upload...", fg="green")
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

        click.secho("\nUpload done!", fg="green")

        # Update file status to uploaded in db
        file_update = FileUpdate(file_id=created_file.file_id, uploaded=True)
        try:
            updated_file = update_file(file_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("\nFile object updated: ", fg="green")
            + f"\n\n{pformat(updated_file.dict())}\n"
        )
        click.secho("All done!", fg="green")


@click.command()
@click.option("--data_id", "-i", required=True)
@click.argument("path")
def update(data_id, path) -> None:
    """Update data object."""
    # Check Authorization
    user = check_auth(config)

    # fetch the data from the db
    query_params = DataGetQueryParams(
        query_type=DataQueryType.GET_DATA_BY_ID, data_id=data_id
    )
    fetched_data = get_data(query_params, user)
    if len(fetched_data) == 0:
        click.secho(f"Data not found!\n\n")
        sys.exit(0)
    data = fetched_data[0]
    # Create archive of the data in a temp dir
    with TemporaryDirectory() as tempd:
        click.echo(
            click.style("\nCreated temporary dir at: ", fg="green")
            + f"{Path(tempd).absolute()}"
        )
        archive_path = make_archive(data.name, path, Path(tempd))
        click.secho(
            click.style("Archive created at: ", fg="green")
            + f"{Path(archive_path).absolute()}\n"
        )

        # Create file in db
        file = File(
            name=data.name,
            ext=data.ext,
            file_type=data.file_type,
            parent_id=data.data_id,
        )
        try:
            created_file = create_file([file], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        click.echo(
            click.style("File object created:", fg="green")
            + f"\n\n{pformat(created_file.dict())}\n"
        )

        # Update data in db to link with file
        data_update = DataUpdate(data_id=data.data_id, file_id=created_file.file_id)
        try:
            updated_data = update_data(data_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        click.echo(
            click.style("Data and file linked:", fg="green")
            + f"\n\n{pformat(updated_data.dict())}\n"
        )

        # Upload file
        click.secho(f"Starting file upload...", fg="green")
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
            updated_file = update_file(file_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("\nFile object updated: ", fg="green")
            + f"\n\n{pformat(updated_file.dict())}\n"
        )
        click.secho("All done!", fg="green")


@click.command()
@click.option("--data_id", "-i", required=True)
@click.option("--extract", "-e", is_flag=True)
@click.argument("path", default=".")
def get(data_id, extract, path) -> None:
    """Get data object."""
    # Check auth
    user = check_auth(config)
    # fetch the data from the db
    query_params = DataGetQueryParams(
        query_type=DataQueryType.GET_DATA_BY_ID, data_id=data_id
    )
    fetched_data = get_data(query_params, user)
    if len(fetched_data) == 0:
        click.secho(f"Data not found!\n\n")
        sys.exit(0)
    data = fetched_data[0]
    click.echo(
        click.style("Data object:", fg="green") + f"\n\n{pformat(data.dict())}\n"
    )
    # get file from data
    query_params = FileGetQueryParams(
        query_type=FileQueryType.GET_FILE_BY_ID, file_id=data.file_id
    )
    fetched_file = get_file(query_params, user)
    if len(fetched_file) == 0:
        click.secho(f"File not found!\n\n")
        sys.exit(0)
    file = fetched_file[0]
    click.echo(
        click.style("File object:", fg="green") + f"\n\n{pformat(file.dict())}\n"
    )
    # Download file
    click.secho(f"Starting file download...", fg="green")
    resp = requests.get(file.presigned_url, stream=True)
    total = int(resp.headers.get("content-length", 0))
    with open(
        Path(path).joinpath(f"{file.file_id}.{file.ext}"), "wb"
    ) as download_file, tqdm(
        desc=str(file.file_id),
        total=total,
        unit="iB",
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in resp.iter_content(chunk_size=1024):
            size = download_file.write(data)
            bar.update(size)
    # Unpack archive
    if extract:
        click.secho(f"Unpacking archive...", fg="green")
        shutil.unpack_archive(Path(path).joinpath(f"{file.file_id}.{file.ext}"))
    click.secho(f"All done!", fg="green")


@click.group()
def data() -> None:
    """Data commands."""
    pass


data.add_command(create)
data.add_command(update)
data.add_command(get)
