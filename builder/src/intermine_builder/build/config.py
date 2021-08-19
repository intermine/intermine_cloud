from typing import Mapping

CONFIG = {}


def set_config(config: dict) -> None:
    global CONFIG
    CONFIG = config


def get_config() -> Mapping:
    return CONFIG
