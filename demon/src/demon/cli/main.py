"""Command-line interface."""

from blackcap.cli.publish import pub
from blackcap.cli.schedule import sched
from blackcap.cli.subscribe import sub
from blackcap.configs import config_registry
import click

from demon.cli.data import data
from demon.cli.mine import mine
from demon.cli.template import template
from .. import __version__


config = config_registry.get_config()


@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """Demon console."""
    pass


main.add_command(pub)
main.add_command(sched)
main.add_command(sub)
main.add_command(data)
main.add_command(template)
main.add_command(mine)
