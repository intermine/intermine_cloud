"""Compose configs."""

from blackcap.configs import config_registry

from compose.configs.compose_default import ComposeDefaultConfig
from compose.configs.compose_testing import ComposeTestingConfig

config_registry.add_config(ComposeDefaultConfig())
config_registry.add_config(ComposeTestingConfig())
