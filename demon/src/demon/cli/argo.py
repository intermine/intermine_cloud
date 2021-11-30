"""CLI for Argo-related functionality."""

import click

from demon.observer import argo_observer


@click.command()
@click.option(
    "--namespace", default="default", help="Namespace where Argo Workflows are run."
)
def forward(namespace: str) -> None:
    """Forward Argo-related Kubernetes events to NATS."""
    argo_observer.main(namespace)


@click.group()
def argo() -> None:
    """Argo-related commands."""
    pass


argo.add_command(forward)
