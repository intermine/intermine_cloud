"""CLI interface to builder."""
import os
import sys
from pathlib import Path

import click
import docker

from intermine_builder import MineBuilder
from intermine_builder.properties import create_properties, write_properties, write_solr_host
from intermine_builder.project_xml import parse_project_xml

# There really is no (clean) way to have both separate commands for the methods
# that need to be handled differently, and dynamic resolution of method names.
# This means we can't leverage option validation for each command, and need to
# do it manually. Trust us; we tried hard.

BUILDER_CONSTRUCTOR_OPTIONS = ["build_image", "data_path"]


@click.command()
@click.argument("mine")
@click.argument("task")
@click.option("--log", is_flag=True)
# Constructor
@click.option("--build-image", is_flag=True)
@click.option("--data-path", type=click.Path(exists=True))
@click.option("--data-dir", multiple=True, type=click.Path(exists=True), help="Example: --data-dir ~/mydata:/data --data-dir /malaria:/data/malaria")
# integrate method
@click.option("--source")
@click.option("--action")
# post_process method
@click.option("--process")
# create_properties_file method
@click.option("--overrides-properties")
# add_data_source method
@click.option("--name")
@click.option("--type")
@click.option("--property", multiple=True, help="Example: --property 'name=src.data.dir,location=/data/panther' --property 'name=panther.organisms,value=7227 6239 9606'")
# methods that use gradle
@click.option("--stacktrace", is_flag=True)
@click.option("--info", is_flag=True)
@click.option("--debug", is_flag=True)
@click.option("--scan", is_flag=True)
def main(mine, task, **options):
    """Run tasks on a mine using a transient container."""
    volumes = None
    if options['data_dir']:
        volumes = {}
        for volume in options['data_dir']:
            (k, v) = volume.split(':')
            volumes[Path(k)] = {
                'bind': v,
                'mode': 'ro'
            }

    builder_options = {k: options[k] for k in BUILDER_CONSTRUCTOR_OPTIONS}
    builder = MineBuilder(mine, volumes=volumes, **builder_options)
    try:
        method = getattr(builder, task)
    except AttributeError:
        click.echo("No task named: " + task, err=True)
        return

    try:
        if task == "create_properties_file":
            # TODO parse options['overrides_properties'] which is path to .properties file
            click.echo(task + " task is not implemented yet", err=True)
        elif task == "add_data_source":
            if not options["name"] or not options["type"]:
                click.echo(task + " task requires --name and --type", err=True)
                return
            props = (
                [
                    dict([kv.split("=") for kv in prop.split(",")])
                    for prop in options["property"]
                ]
                if options["property"]
                else []
            )
            source = {"name": options["name"], "type": options["type"], "properties": props}
            log = method(source)
        elif task == "integrate":
            if not options["source"]:
                click.echo(task + " task requires --source", err=True)
                return
            log = method(options["source"], **options)
        elif task == "post_process":
            if not options["process"]:
                click.echo(task + " task requires --process", err=True)
                return
            log = method(options["process"], **options)
        else:
            log = method(**options)

        if options["log"] and log:
            click.echo(log)
    except docker.errors.ContainerError as err:
        click.echo(str(err.stderr, 'utf-8'), err=True)
        sys.exit(err.exit_status)


def prepare_fn(**options):
    mine_path = Path(options['mine_path'])
    mine_name = mine_path.name

    overrides = None
    if options['override']:
        overrides = {}
        for kv in options['override']:
            (k, v) = kv.split('=')
            overrides[k] = v

    kwargs = dict([(envvar, os.environ.get(envvar)) for envvar in
                    ['PGHOST', 'PGPORT', 'PSQL_USER', 'PSQL_PWD', 'TOMCAT_HOST',
                     'TOMCAT_PORT', 'TOMCAT_USER', 'TOMCAT_PWD']
                    if envvar in os.environ])
    kwargs['overrides'] = overrides

    properties = create_properties(**kwargs)
    write_properties(Path.home() / '.intermine' / (mine_name + '.properties'), properties)
    write_solr_host(mine_path, os.getenv('SOLR_HOST', 'localhost'), mine_name)


@click.command()
@click.option("--mine-path", type=click.Path(exists=True, file_okay=False), required=True, help="Path to mine directory to be prepared.")
@click.option("--override", multiple=True, help="Example: --override webapp.path=kittenmine --override project.title=KittenMine")
def prepare(**options):
    """Make changes to the filesystem to faciliate building a mine - no containers used.
    Expects envvars for dependent services to be present."""
    prepare_fn(**options)


@click.command()
@click.option("--mine-path", type=click.Path(exists=True, file_okay=False), required=True, help="Path to mine directory to be prepared.")
@click.option("--bio-path", type=click.Path(exists=True, file_okay=False), required=False, help="Path to optional bio directory to be installed.")
@click.option("--override", multiple=True, help="Example: --override webapp.path=kittenmine --override project.title=KittenMine")
def job(**options):
    """Perform a complete build and deployment of a mine - no containers used.
    Expects envvars for dependent services to be present."""
    mine_path = Path(options['mine_path'])
    mine_name = mine_path.name

    prepare_fn(**options)

    builder = MineBuilder(mine_name, mine_path=mine_path.parent, containerless=True)
    if 'bio_path' in options:
        builder.install(cwd=options['bio_path'], stacktrace=True)
    builder.clean(stacktrace=True)
    builder.build_db(stacktrace=True)

    project = parse_project_xml(mine_path / "project.xml")
    for source in project['sources']:
        builder.integrate(source, stacktrace=True)
    for postprocess in project['post-processing']:
        builder.post_process(postprocess, stacktrace=True)

    builder.build_user_db(stacktrace=True)
    builder.deploy(stacktrace=True)
