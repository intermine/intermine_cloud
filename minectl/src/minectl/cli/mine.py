"""Mine commands."""

from pathlib import Path

import click
from cookiecutter.main import cookiecutter


@click.group()
def deploy() -> None:
    """Mine deploy commands."""
    pass


@click.command()
def local() -> None:
    """Mine deploy locally."""
    pass


deploy.add_command(local)


@click.command()
def new() -> None:
    """Create new InterMine repo."""
    mine_biotestmine_template_path = (
        Path(__file__).parents[1].joinpath("templates/mine_biotestmine")
    )
    print(mine_biotestmine_template_path.resolve())
    cookiecutter(f"{mine_biotestmine_template_path.resolve()}/")


@click.group()
def mine() -> None:
    """Mine commands."""
    pass


mine.add_command(deploy)
mine.add_command(new)
