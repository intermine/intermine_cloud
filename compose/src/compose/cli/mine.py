"""Mine commands."""

import json
from pathlib import Path
from pprint import pformat
from shutil import make_archive
import shutil
import sys
from tempfile import TemporaryDirectory

from compose.blocs.data import get_data
from compose.blocs.file import create_file, update_file, get_file
from compose.blocs.mine import get_mine, create_mine, update_mine
from compose.blocs.rendered_template import (
    create_rendered_template,
    update_rendered_template,
    get_rendered_template,
)
from compose.blocs.template import get_template
from compose.configs import config_registry
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.api.mine.put import MineUpdate
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import Template, RenderedTemplate
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
@click.option("--desc")
@click.option("--pref", default="{}")
@click.option("--template_id", "-t", required=True)
@click.option("--data_ids", "-d", required=True, multiple=True)
def create(name, desc, pref, template_id, data_ids) -> None:
    """Create data object."""
    # Check Authorization
    user = check_auth(config)

    # Check if template exist
    query_params = TemplateGetQueryParams(
        query_type=TemplateQueryType.GET_TEMPLATE_BY_ID, template_id=template_id
    )
    fetched_template = get_template(query_params, user)
    if len(fetched_template) == 0:
        click.secho(f"Template not found!\n\n")
        sys.exit(0)
    template = fetched_template[0]
    click.echo(
        click.style("Template object:", fg="green")
        + f"\n\n{pformat(template.dict())}\n"
    )

    # get file from template
    query_params = FileGetQueryParams(
        query_type=FileQueryType.GET_FILE_BY_ID, file_id=template.latest_file_id
    )
    fetched_file = get_file(query_params, user)
    if len(fetched_file) == 0:
        click.secho(f"File not found!\n\n")
        sys.exit(0)
    file = fetched_file[0]
    click.echo(
        click.style("File object:", fg="green") + f"\n\n{pformat(file.dict())}\n"
    )

    # Check if data files exist
    data_files = []
    for data_id in data_ids:
        query_params = DataGetQueryParams(
            query_type=DataQueryType.GET_DATA_BY_ID, data_id=data_id
        )
        fetched_data = get_data(query_params, user)
        if len(fetched_data) == 0:
            click.secho(f"Data not found!: {data_id}\n\n")
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
        data_files.append(file)

    # Create a mine in the db
    mine = Mine(
        name=name,
        description=desc,
        preference=json.loads(pref),
        data_file_ids=data_files,
    )
    try:
        created_mine = create_mine([mine], user)[0]
    except Exception as e:
        click.secho(f"Error occured: {e}\n\n Exiting....")
        sys.exit(1)
    click.echo(
        click.style("Mine object created:", fg="green")
        + f"\n\n{pformat(created_mine.dict())}\n"
    )

    # Create archive of the rendered template in a temp dir
    with TemporaryDirectory() as tempd:
        click.echo(
            click.style("\nCreated temporary dir at: ", fg="green")
            + f"{Path(tempd).absolute()}"
        )

        # Create a rendered template
        rendered_template = RenderedTemplate(
            name=name, description=desc, template_vars=[]
        )
        try:
            created_rendered_template = create_rendered_template(
                [rendered_template], user
            )[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("RenderedTemplate object created:", fg="green")
            + f"\n\n{pformat(created_rendered_template.dict())}\n"
        )

        # Download template
        click.secho(f"Starting template download...", fg="green")
        resp = requests.get(file.presigned_url, stream=True)
        total = int(resp.headers.get("content-length", 0))
        with open(Path(tempd).joinpath(f"template.tar"), "wb") as download_file, tqdm(
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
        click.secho(f"Unpacking archive...", fg="green")
        shutil.unpack_archive(Path(tempd).joinpath(f"template.tar"))
        click.secho(f"All done!", fg="green")

        # Render the fetched template with provided template vars
        # TODO: Do it properly later, for now just cp the downloaded template
        shutil.copytree(
            Path(tempd).joinpath("template"), Path(tempd).joinpath("rendered")
        )

        archive_path = make_archive(
            "rendered", Path(tempd).joinpath("rendered"), Path(tempd)
        )
        click.secho(
            click.style("Archive created at: ", fg="green")
            + f"{Path(archive_path).absolute()}\n"
        )

        # Create file in db
        file = File(
            name=name,
            ext="tar",
            file_type="rendered_template",
            parent_id=created_rendered_template.rendered_template_id,
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

        # Update Mine and RenderedTemplate in db to link with file
        mine_update = MineUpdate(
            mine_id=created_mine.mine_id, file_id=created_file.file_id
        )
        try:
            updated_mine = update_mine(mine_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Mine and file linked:", fg="green")
            + f"\n\n{pformat(updated_mine.dict())}\n"
        )

        rendered_template_update = RenderedTemplateUpdate(
            rendered_template_id=created_rendered_template.rendered_template_id,
            file_id=created_file.file_id,
        )
        try:
            updated_rendered_template = update_rendered_template(
                rendered_template_update
            )
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Rendered Template and file linked:", fg="green")
            + f"\n\n{pformat(updated_rendered_template.dict())}\n"
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
@click.option("--mine_id", "-i", required=True)
@click.argument("path")
def update(mine_id, path) -> None:
    """Update mine object."""
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
