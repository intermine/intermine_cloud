#!/usr/bin/python3

import argparse
import logging

from jinja2 import Environment, FileSystemLoader

def parse_arguments():
    parser = argparse.ArgumentParser(
            usage="%(prog)s --mine-name MINE_NAME --bucket-path PATH_TO_BUCKET_ARTIFACTS",
            description="Make a local testrun of the minedeployer workflow."
            )
    parser.add_argument('--mine-name', required=True, help="Name of mine to build")
    parser.add_argument('--bucket-path', required=True, help="Path to artifacts inside a MinIO bucket")

    return parser.parse_args()

def main():
    logging.basicConfig(format='%(message)s')
    log = logging.getLogger(__name__)

    args = parse_arguments()

    bucket_path = args.bucket_path
    mine_name = args.mine_name

    context = {
            'mine_name': mine_name,
            'pretty_mine_name': mine_name.capitalize(),
            'minedir_path': bucket_path + '/mine-dir.tgz',
            'postgresdump_path': bucket_path + '/postgres-dump.tgz',
            'solrdump_path': bucket_path + '/solr-dump.tgz',
            }

    tmpl_loader = FileSystemLoader(searchpath='./')
    tmpl_env = Environment(loader=tmpl_loader)
    tmpl = tmpl_env.get_template('minedeployer.yaml.template')
    output = tmpl.render(**context)

    with open('minedeployer.yaml', 'w') as f:
        f.write(output)

    print("Succesfully rendered minedeployer.yaml")

main()
