"""Compose configs."""

from compose.configs.compose_default import ComposeDefaultConfig

from blackcap.configs import config_registry


config_registry.add_config(ComposeDefaultConfig())