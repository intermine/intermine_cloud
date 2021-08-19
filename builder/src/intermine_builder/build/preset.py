"""Build process for using (extending) preset mines."""

from pathlib import Path

from logzero import logger

from intermine_builder.build import gradle
from intermine_builder.build import project_xml
from intermine_builder.build.config import get_config
from intermine_builder.build.properties import create_properties, write_properties


def main() -> None:
    config = get_config()

    properties = create_properties(override=config["properties"])

    logger.info("Creating " + config["mine"] + ".properties")
    write_properties(
        Path.home() / ".intermine" / (config["mine"] + ".properties"), properties
    )

    for source in config["datasources"]:
        logger.info("Adding data source: " + source["name"])
        project_xml.append_source(source)

    for source in config["datasources"]:
        gradle.integrate(source["name"])

    gradle.post_process()

    gradle.deploy()
