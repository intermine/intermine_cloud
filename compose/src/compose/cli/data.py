"""Data commands."""

from pathlib import Path
from shutil import make_archive
from tempfile import tempdir

import click


@click.command()
@click.option("--name")
@click.argument("Path")
def create(name, path) -> None:
    """Create data."""
    # Create archive of the data in a temp dir
    make_archive()

    # Create a data in the db

    # Create file in db

    # Update data in db

    # Upload file

    # Update file status to uploaded in db


@click.command()
@click.option("--id")
@click.argument("Path")
def update(id, path) -> None:
    """Update data."""
    # Create archive of the data in a temp dir
    make_archive()

    # fetch the data from the db

    # Create file in db

    # Update data in db

    # Upload file

    # Update file status to uploaded in db


@click.command()
@click.option("--id")
@click.argument("Path")
def get(id, path) -> None:
    """Get data."""
    # fetch the data from the db

    # Download file in a temp dir

    # Unpack archive


@click.group()
def data() -> None:
    """Data commands."""
    pass


data.add_command(create)
