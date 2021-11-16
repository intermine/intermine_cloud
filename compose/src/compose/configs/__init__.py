"""Compose configs."""

from blackcap.configs import config_registry  # v noqa: F401

from compose.configs.compose_default import ComposeDefaultConfig


config_registry.add_config(ComposeDefaultConfig())
