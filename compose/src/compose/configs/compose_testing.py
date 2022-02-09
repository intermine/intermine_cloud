"""Testing compose config."""

from xdg import xdg_data_home

from compose.configs.compose_default import ComposeDefaultConfig


class ComposeTestingConfig(ComposeDefaultConfig):
    """Testing compose config."""

    DB_NAME: str = "compose_test"
    DB_URI: str = f"sqlite:////{xdg_data_home() / ('imcloud') / ('compose_test.db')}"

    def get_config_name(self: "ComposeTestingConfig") -> str:
        """Return Config name.

        Returns:
            str: Name of the config
        """
        return "TESTING"
