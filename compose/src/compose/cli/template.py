"""Template commands."""

from pathlib import Path
from pprint import pformat
from shutil import make_archive
import shutil
import sys
from tempfile import TemporaryDirectory

from compose.blocs.template import create_template, update_template, get_template
from compose.blocs.file import create_file, update_file, get_file
from compose.configs import config_registry
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.api.template.put import TemplateUpdate
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.template import Template
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
@click.option("--desc")
@click.argument("path")
def create(name, desc, path) -> None:
    """Create template object."""
    # Check Authorization
    user = check_auth(config)

    # Create archive of the template in a temp dir
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
        # Create a template in the db
        template = Template(name=name, description=desc, template_vars=[])
        try:
            created_template = create_template([template], user)[0]
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Template object created:", fg="green")
            + f"\n\n{pformat(created_template.dict())}\n"
        )

        # Create file in db
        file = File(
            name=name,
            ext="tar",
            file_type="template",
            parent_id=created_template.template_id,
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

        # Update template in db to link with file
        template_update = TemplateUpdate(
            template_id=created_template.template_id,
            latest_file_id=created_file.file_id,
        )
        try:
            updated_template = update_template(template_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Template and file linked:", fg="green")
            + f"\n\n{pformat(updated_template.dict())}\n"
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
@click.option("--template_id", "-i", required=True)
@click.argument("path")
def update(template_id, path) -> None:
    """Update template object."""
    # Check Authorization
    user = check_auth(config)

    # fetch the template from the db
    query_params = TemplateGetQueryParams(
        query_type=TemplateQueryType.GET_TEMPLATE_BY_ID, template_id=template_id
    )
    fetched_template = get_template(query_params, user)
    if len(fetched_template) == 0:
        click.secho(f"Template not found!\n\n")
        sys.exit(0)
    template = fetched_template[0]
    # Create archive of the template in a temp dir
    with TemporaryDirectory() as tempd:
        click.echo(
            click.style("\nCreated temporary dir at: ", fg="green")
            + f"{Path(tempd).absolute()}"
        )
        archive_path = make_archive(template.name, path, Path(tempd))
        click.secho(
            click.style("Archive created at: ", fg="green")
            + f"{Path(archive_path).absolute()}\n"
        )

        # Create file in db
        file = File(
            name=template.name,
            ext=template.ext,
            file_type=template.file_type,
            parent_id=template.template_id,
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

        # Update template in db to link with file
        template_update = TemplateUpdate(
            template_id=template.template_id, latest_file_id=created_file.file_id
        )
        try:
            updated_template = update_template(template_update)
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)

        click.echo(
            click.style("Template and file linked:", fg="green")
            + f"\n\n{pformat(updated_template.dict())}\n"
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
@click.option("--template_id", "-i", required=True)
@click.option("--extract", "-e", is_flag=True)
@click.argument("path", default=".")
def get(template_id, extract, path) -> None:
    """Get template object."""
    # Check auth
    user = check_auth(config)
    # fetch the template from the db
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
def template() -> None:
    """Template commands."""
    pass


template.add_command(create)
template.add_command(update)
template.add_command(get)
