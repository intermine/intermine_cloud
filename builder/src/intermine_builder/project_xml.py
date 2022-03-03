"""Working with project.xml."""

import os
import xml.etree.ElementTree as ET
from pathlib import Path

from intermine_builder.types import DataSource

def _read(project_xml_path: os.PathLike) -> ET.ElementTree:
    return ET.parse(project_xml_path)


def _write(project_xml_path: os.PathLike, tree: ET.ElementTree) -> None:
    tree.write(project_xml_path)


def parse_project_xml(project_xml_path: os.PathLike) -> dict:
    tree = _read(project_xml_path)
    root  = tree.getroot()

    res = { 'sources': [], 'post-processing': [] }

    sources_el = root.find('sources')
    if sources_el:
        for source in sources_el.findall('source'):
            res['sources'].append(source.attrib['name'])

    postprocessing_el = root.find('post-processing')
    if postprocessing_el:
        for postprocess in postprocessing_el.findall('post-process'):
            res['post-processing'].append(postprocess.attrib['name'])

    return res


def append_source(project_xml_path: os.PathLike, source: DataSource) -> None:
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
