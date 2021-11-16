"""Mine commands."""

import json
import os
from pathlib import Path
from pprint import pformat
import shutil
import sys
from tempfile import TemporaryDirectory

import click
import requests
from tqdm import tqdm
from tqdm.utils import CallbackIOWrapper

from compose.blocs.data import get_data
from compose.blocs.file import create_file, get_file, update_file
from compose.blocs.mine import create_mine, get_mine, update_mine
from compose.blocs.rendered_template import (
    create_rendered_template,
    update_rendered_template,
)
from compose.blocs.template import get_template
from compose.configs import config_registry
from compose.schemas.api.data.get import DataGetQueryParams, DataQueryType
from compose.schemas.api.file.get import FileGetQueryParams, FileQueryType
from compose.schemas.api.file.put import FileUpdate
from compose.schemas.api.mine.get import MineGetQueryParams, MineQueryType
from compose.schemas.api.mine.put import MineUpdate
from compose.schemas.api.rendered_template.put import RenderedTemplateUpdate
from compose.schemas.api.template.get import TemplateGetQueryParams, TemplateQueryType
from compose.schemas.file import File
from compose.schemas.mine import Mine
from compose.schemas.template import RenderedTemplate
from compose.utils.auth import check_auth


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
def create(name, desc, pref, template_id, data_ids) -> None:  # noqa: C901, ANN001
    """Create data object."""
    # Check Authorization
    user = check_auth(config)

    # !TODO: Create a linked job as well

    # noqa: DAR101
    # Check if template exist
    query_params = TemplateGetQueryParams(
        query_type=TemplateQueryType.GET_TEMPLATE_BY_ID, template_id=template_id
    )
    fetched_template = get_template(query_params, user)
    if len(fetched_template) == 0:
        click.secho("Template not found!\n\n")
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
        click.secho("File not found!\n\n")
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
            click.secho("File not found!\n\n")
            sys.exit(0)
        file = fetched_file[0]
        click.echo(
            click.style("File object:", fg="green") + f"\n\n{pformat(file.dict())}\n"
        )
        data_files.append(file)

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
        click.secho("Starting template download...", fg="green")
        resp = requests.get(file.presigned_url, stream=True)
        total = int(resp.headers.get("content-length", 0))
        with open(Path(tempd).joinpath("template.tar"), "wb") as download_file, tqdm(
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
        click.secho("Unpacking archive...", fg="green")
        shutil.unpack_archive(
            Path(tempd).joinpath("template.tar"), Path(tempd).joinpath("template")
        )
        click.secho(
            f"Archive unpacked at {Path(tempd).joinpath('template')}", fg="green"
        )
        click.secho("Rendering template...", fg="green")
        # Render the fetched template with provided template vars
        # TODO: Do it properly later, for now just cp the downloaded template
        shutil.copytree(
            Path(tempd).joinpath("template"), Path(tempd).joinpath("rendered")
        )

        archive_path = make_archive(
            "rendered", Path(tempd).joinpath("rendered"), Path(tempd)
        )
        click.secho(
            click.style("Rendered archive created at: ", fg="green")
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

        # Create a mine in the db
        mine = Mine(
            name=name,
            description=desc,
            preference=json.loads(pref),
            rendered_template_file_id=created_file.file_id,
            data_file_ids=[str(file.file_id) for file in data_files],
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

        # Update RenderedTemplate in db to link with file
        rendered_template_update = RenderedTemplateUpdate(
            rendered_template_id=created_rendered_template.rendered_template_id,
            file_id=created_file.file_id,
            parent_mine_id=mine.mine_id,
        )
        try:
            updated_rendered_template = update_rendered_template(
                rendered_template_update
            )
        except Exception as e:
            click.secho(f"Error occured: {e}\n\n Exiting....")
            sys.exit(1)
        click.echo(
            click.style("Rendered Template linked with mine and file:", fg="green")
            + f"\n\n{pformat(updated_rendered_template.dict())}\n"
        )

        # Upload file
        click.secho("Starting file upload...", fg="green")
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
@click.option("--name")
@click.option("--desc")
@click.option("--pref", default="{}")
def update(mine_id, name, desc, pref) -> None:  # noqa: C901, ANN001
    """Update mine object."""
    # Check Authorization
    user = check_auth(config)

    # fetch the mine from the db
    # noqa: DAR101
    query_params = MineGetQueryParams(
        query_type=MineQueryType.GET_MINE_BY_ID, mine_id=mine_id
    )
    fetched_mine = get_mine(query_params, user)
    if len(fetched_mine) == 0:
        click.secho("Mine not found!\n\n")
        sys.exit(0)
    mine = fetched_mine[0]
    click.echo(
        click.style("\nMine found: ", fg="green") + f"\n\n{pformat(mine.dict())}\n"
    )

    # Update mine
    mine_update = MineUpdate(
        mine_id=mine_id, name=name, description=desc, preference=pref
    )
    try:
        updated_mine = update_mine(mine_update)
    except Exception as e:
        click.secho(f"Error occured: {e}\n\n Exiting....")
        sys.exit(1)
    click.echo(
        click.style("\nMine object updated: ", fg="green")
        + f"\n\n{pformat(updated_mine.dict())}\n"
    )
    click.secho("All done!", fg="green")


@click.command()
@click.option("--mine_id", "-i", required=True)
@click.option("--extract", "-e", is_flag=True)
@click.argument("path", default=".")
def get(mine_id, extract, path) -> None:  # noqa: c901, ANN001
    """Get mine object."""
    # Check auth
    user = check_auth(config)
    # fetch the mine from the db
    # noqa: DAR101
    query_params = MineGetQueryParams(
        query_type=MineQueryType.GET_MINE_BY_ID, mine_id=mine_id
    )
    fetched_mine = get_mine(query_params, user)
    if len(fetched_mine) == 0:
        click.secho("Mine not found!\n\n")
        sys.exit(0)
    mine = fetched_mine[0]
    click.echo(
        click.style("Mine object:", fg="green") + f"\n\n{pformat(mine.dict())}\n"
    )

    # get file from rendered template
    query_params = FileGetQueryParams(
        query_type=FileQueryType.GET_FILE_BY_ID,
        file_id=mine.rendered_template_file_id,
    )
    fetched_file = get_file(query_params, user)
    if len(fetched_file) == 0:
        click.secho("File not found!\n\n")
        sys.exit(0)
    file = fetched_file[0]
    click.echo(
        click.style("File object:", fg="green") + f"\n\n{pformat(file.dict())}\n"
    )
    # Download file
    click.secho("Starting file download...", fg="green")
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
        click.secho("Unpacking archive...", fg="green")
        shutil.unpack_archive(Path(path).joinpath(f"{file.file_id}.{file.ext}"))

    # TODO: Download related source data files and database dumps
    click.secho("All done!", fg="green")


@click.group()
def mine() -> None:
    """Mine commands."""
    pass


mine.add_command(create)
mine.add_command(update)
mine.add_command(get)
