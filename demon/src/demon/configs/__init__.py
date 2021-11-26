"""Demon configs."""

from blackcap.configs import config_registry

from demon.configs.demon_default import DemonDefaultConfig


config_registry.add_config(DemonDefaultConfig())
