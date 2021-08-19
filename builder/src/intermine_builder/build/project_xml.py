"""Working with project.xml."""

from pathlib import Path
import xml.etree.ElementTree as ET

from logzero import logger

from intermine_builder.build.config import get_config


def _read() -> ET.ElementTree:
    config = get_config()
    minedir = Path.home() / "intermine" / config["mine"]
    return ET.parse(minedir / "project.xml")


def _write(tree: ET.ElementTree) -> None:
    config = get_config()
    minedir = Path.home() / "intermine" / config["mine"]
    tree.write(minedir / "project.xml")


def append_source(source: dict) -> None:
    tree = _read()

    root = tree.getroot()
    sources_el = root.find("sources")

    if sources_el:
        source_el = ET.SubElement(
            sources_el,
            "source", {"name": source["name"], "type": source["type"]}
        )
    else:
        raise RuntimeError('Invalid project.xml - Cannot find sources attribute')

    for property in source["properties"]:
        ET.SubElement(source_el, "property", property)

    _write(tree)
