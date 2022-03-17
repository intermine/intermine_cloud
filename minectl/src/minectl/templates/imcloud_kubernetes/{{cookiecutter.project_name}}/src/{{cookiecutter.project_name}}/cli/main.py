"""{{cookiecutter.project_name}} CLI"""

# flake8: noqa

import click
from iminfra.cli.bootstrap import boot

from .. import __version__



@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """{{cookiecutter.project_name}} console."""
    pass


main.add_command(boot)