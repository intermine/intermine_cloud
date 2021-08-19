"""Entrypoint for the build process."""

import copy
import json
import pprint
import sys
from typing import Optional

from logzero import logger

from intermine_builder.build.config import set_config
from intermine_builder.build import preset


def start(file: Optional[str] = None) -> None:
    """Start the build process.

    Expects JSON describing the mine configuration as input.

    Args:
        file: string or pathlike object to JSON file.

    """
    config = None

    if file:
        try:
            with open(file) as jsonFile:
                config = json.load(jsonFile)
                jsonFile.close()
        except:
            logger.error("Could not parse JSON input file")
            raise
    # elif # If we want to add support for other types of JSON input.

    if not config:
        logger.error("No config provided")
        sys.exit(1)

    set_config(config)

    # Remove sensitive data from config logged.
    redacted_config = copy.deepcopy(config)
    for propkey in redacted_config["properties"].keys():
        if "password" in propkey.lower():
            redacted_config["properties"][propkey] = "[redacted]"

    logger.info("Starting build with config:\n" + pprint.pformat(redacted_config))

    if "preset" in config:
        preset.main()
    else:
        logger.error("Unsupported input schema")
        sys.exit(1)
