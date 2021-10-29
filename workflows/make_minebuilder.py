#!/usr/bin/python3

import argparse
import base64
import sys
import logging
import os
import subprocess
import tarfile
from pathlib import Path
import xml.etree.ElementTree as ET

from jinja2 import Environment, FileSystemLoader
from minio import Minio

def parse_arguments():
    parser = argparse.ArgumentParser(
            usage="%(prog)s --mine-path PATH_TO_MINE --source-path PATH_TO_DATASOURCES",
            description="Make a local testrun of the minebuilder workflow."
            )
    parser.add_argument('--mine-path', required=True, help="Path to a mine directory")
    parser.add_argument('--source-path', required=True, help="Path to a directory containing data sources to be integrated")

    return parser.parse_args()

def parse_project_xml(path):
    tree = ET.parse(path)
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

    return project

def read_minio_secret(key_name):
    """key_name can be 'accesskey' or 'secretkey'."""
    coded = subprocess.check_output(["kubectl", "get", "secret", "argo-artifacts",
        "-o", "jsonpath='{.data." + key_name + "}'"]).decode()
    return base64.b64decode(coded).decode()

def upload_artifacts(mine_path, source_path):
    mc = Minio("localhost:9000", read_minio_secret('accesskey'), read_minio_secret('secretkey'), secure=False)

    print("Compressing artifacts...")
    with tarfile.open('mine.tgz', 'w:gz') as tar:
        tar.add(mine_path, arcname=mine_path.name)
    with tarfile.open('source.tgz', 'w:gz') as tar:
        tar.add(source_path, arcname=source_path.name)

    print("Uploading artifacts...")
    with open('mine.tgz', 'rb') as archive:
        mc.put_object('my-bucket', 'mine.tgz', archive, os.path.getsize('mine.tgz'))
    with open('source.tgz', 'rb') as archive:
        mc.put_object('my-bucket', 'source.tgz', archive, os.path.getsize('source.tgz'))

def main():
    logging.basicConfig(format='%(message)s')
    log = logging.getLogger(__name__)

    args = parse_arguments()

    mine_path = Path(args.mine_path)
    source_path = Path(args.source_path)

    if not (mine_path.exists() and source_path.exists()):
        log.error("Both paths need to point to an existing directory")
        sys.exit(1)

    upload_artifacts(mine_path, source_path)

    project = parse_project_xml(mine_path / 'project.xml')

    context = {
            'mine_name': mine_path.name,
            'source_name': source_path.name,
            'sources': project['sources'],
            'post_processing': project['post_processing']
            }

    tmpl_loader = FileSystemLoader(searchpath='./')
    tmpl_env = Environment(loader=tmpl_loader)
    tmpl = tmpl_env.get_template('minebuilder.yaml.template')
    output = tmpl.render(**context)

    with open('minebuilder.yaml', 'w') as f:
        f.write(output)

    print("Succesfully rendered minebuilder.yaml")

main()
