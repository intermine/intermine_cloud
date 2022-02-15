"""InterMine Cloud commands."""

from pathlib import Path

import click
from cookiecutter.main import cookiecutter


@click.command()
def new() -> None:
    """Create new IMCloud repo."""
    imcloud_template_path = (
        Path(__file__).parents[1].joinpath("templates/imcloud_kubernetes")
    )
    print(imcloud_template_path.resolve())
    cookiecutter(f"{imcloud_template_path.resolve()}/")


@click.group()
def imcloud() -> None:
    """Intermine Cloud commands."""
    pass


imcloud.add_command(new)
