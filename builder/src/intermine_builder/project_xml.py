"""Working with project.xml."""

import os
import xml.etree.ElementTree as ET


def _read(project_xml_path: os.PathLike) -> ET.ElementTree:
    return ET.parse(project_xml_path)


def _write(project_xml_path: os.PathLike, tree: ET.ElementTree) -> None:
    tree.write(project_xml_path)


def append_source(project_xml_path: os.PathLike, source: dict) -> None:
    tree = _read(project_xml_path)

    root = tree.getroot()
    sources_el = root.find("sources")

    if sources_el:
        source_el = ET.SubElement(
            sources_el,
            "source", {"name": source["name"], "type": source["type"]}
        )
    else:
        raise RuntimeError('Invalid project.xml - Cannot find sources attribute')

    for prop in source["properties"]:
        ET.SubElement(source_el, "property", prop)

    _write(project_xml_path, tree)
