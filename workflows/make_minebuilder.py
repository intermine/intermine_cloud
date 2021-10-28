#!/usr/bin/python3

import sys
import logging
from pathlib import Path
import xml.etree.ElementTree as ET
from jinja2 import Environment, FileSystemLoader

logging.basicConfig(format='%(message)s')
log = logging.getLogger(__name__)

if not len(sys.argv) == 2:
    log.warning("Please specify path to a mine")
    sys.exit(1)

mine_path = Path(sys.argv[1])

if not mine_path.exists():
    log.warning("Path does not point to an existing directory")
    sys.exit(1)

mine_name = mine_path.name

tree = ET.parse(mine_path / 'project.xml')
root  = tree.getroot()

project = { 'sources': [], 'post_processing': [] }

sources_el = root.find('sources')
if sources_el:
    for source in sources_el.findall('source'):
        project['sources'].append(source.attrib['name'])

postprocessing_el = root.find('post-processing')
if postprocessing_el:
    for postprocess in postprocessing_el.findall('post-process'):
        project['post_processing'].append(postprocess.attrib['name'])

context = {
        'mine_name': mine_name,
        'sources': project['sources'],
        'post_processing': project['post_processing']
        }

tmpl_loader = FileSystemLoader(searchpath='./')
tmpl_env = Environment(loader=tmpl_loader)
tmpl = tmpl_env.get_template('minebuilder.yaml.template')
output = tmpl.render(**context)

with open('minebuilder.yaml', 'w') as f:
    f.write(output)
