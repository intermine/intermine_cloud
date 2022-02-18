"""Minectl CLI"""

# flake8: noqa

import click

from .. import __version__
from minectl.cli.imcloud import imcloud
from minectl.cli.mine import mine
from minectl.cli.tools import tools


@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """MineCTL console."""
    pass


main.add_command(imcloud)
main.add_command(mine)
main.add_command(tools)
