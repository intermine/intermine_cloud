"""Template commands."""

from pathlib import Path
from shutil import make_archive
from tempfile import tempdir

import click


@click.command()
@click.option("--name")
@click.argument("Path")
def create(name, path) -> None:
    """Create template."""
    # Create archive of the template in a temp dir
    make_archive()

    # Create a template in the db

    # Create file in db

    # Update template in db

    # Upload file

    # Update file status to uploaded in db


@click.command()
@click.option("--id")
@click.argument("Path")
def update(id, path) -> None:
    """Update template."""
    # Create archive of the template in a temp dir
    make_archive()

    # fetch the template from the db

    # Create file in db

    # Update template in db

    # Upload file

    # Update file status to uploaded in db


@click.command()
@click.option("--id")
@click.argument("Path")
def get(id, path) -> None:
    """Get template."""
    # fetch the template from the db

    # Download file in a temp dir

    # Unpack archive


@click.group()
def template() -> None:
    """Template commands."""
    pass


template.add_command(create)
