"""Auth utils."""

import sys

from blackcap.schemas.user import User
import click

from compose.auther import auther_registry
from compose.configs import ComposeDefaultConfig


def check_auth(config: ComposeDefaultConfig) -> User:
    """Check authorization in CLI.

    Args:
        config (ComposeDefaultConfig): config object

    Returns:
        User: User object
    """
    user_access_token = config.USER_ACCESS_TOKEN
    auther = auther_registry.get_auther(config.AUTHER)
    try:
        user = auther.extract_user_from_token(user_access_token)
    except Exception:
        click.secho("Authorization failed\n\n Exiting....")
        sys.exit(1)
    if user is None:
        click.secho("Authorization failed\n\n Exiting....")
        sys.exit(1)
    return user
