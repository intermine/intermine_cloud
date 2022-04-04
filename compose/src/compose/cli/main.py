"""Command-line interface."""

from blackcap.auther import auther_registry
from blackcap.cli.create import create
from blackcap.cli.db import db
from blackcap.cli.get import get
from blackcap.cli.publish import pub
from blackcap.cli.schedule import sched
from blackcap.cli.subscribe import sub
from blackcap.configs import config_registry
from blackcap.schemas.api.auth.post import AuthPOSTRequest
import click

from compose.cli.data import data
from compose.cli.mine import mine
from compose.cli.template import template
from .. import __version__


config = config_registry.get_config()


@click.command()
@click.option("--email", required=True, help="email of user")
@click.option("--password", required=True, help="password of user")
def login(email, password) -> None:  # noqa: C901, ANN001
    """Login CLI."""
    auth_creds = AuthPOSTRequest(email=email, password=password)
    auther = auther_registry.get_auther(config.AUTHER)
    # noqa: DAR101
    login_tuple = auther.login_user(auth_creds)
    if login_tuple is None:
        click.secho("Login failed!", fg="red")
    else:
        click.secho(f"Your token: {login_tuple[1]}")
        click.secho(f"Add it to your env\n\n export USER_ACCESS_TOKEN={login_tuple[1]}")


@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """Conductor console."""
    pass


main.add_command(create)
main.add_command(get)
main.add_command(db)
main.add_command(pub)
main.add_command(sched)
main.add_command(login)
main.add_command(sub)
main.add_command(data)
main.add_command(template)
main.add_command(mine)
