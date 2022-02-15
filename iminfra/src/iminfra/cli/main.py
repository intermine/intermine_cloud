"""Minectl CLI"""

# flake8: noqa

import click

from .. import __version__


@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """Intermine infrastructure as code console."""
    pass
