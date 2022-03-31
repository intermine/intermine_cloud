"""Bootstrap commands."""

# flake8: noqa

import click

from .. import __version__


@click.command()
def tools() -> None:
    """Download and perform an isolated install of required tools."""
    pass


@click.group(invoke_without_command=True)
@click.pass_context
def boot(ctx) -> None:
    """Bootstrap infrastructure."""
    print(ctx)
    if ctx.invoked_subcommand is None:
        ctx.invoke(tools)


boot.add_command(tools)
