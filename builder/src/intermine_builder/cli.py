"""CLI interface to builder."""
import sys
from pathlib import Path

import click
import docker

from intermine_builder import MineBuilder

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
