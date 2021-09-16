"""CLI interface to builder."""

import click

from intermine_builder import MineBuilder

# There really is no (clean) way to have both separate commands for the methods
# that need to be handled differently, and dynamic resolution of method names.
# This means we can't leverage option validation for each command, and need to
# do it manually. Trust us; we tried hard.

BUILDER_CONSTRUCTOR_OPTIONS = ["build_image", "data_path"]


@click.command()
@click.argument("mine")
@click.argument("task")
# Constructor
@click.option("--build-image", is_flag=True)
@click.option("--data-path", type=click.Path(exists=True))
# integrate method
@click.option("--source")
@click.option("--action")
# create_properties_file method
@click.option("--overrides-properties")
# add_data_source method
@click.option("--name")
@click.option("--type")
@click.option("--property", multiple=True, help="Example: --property 'name=src.data.dir,location=/data/panther' --property 'name=panther.organisms,value=7227 6239 9606'")
# methods that use gradle
@click.option("--stacktrace", is_flag=True)
def main(mine, task, **options):
    """Run tasks on a mine using a transient container."""
    builder_options = {k: options[k] for k in BUILDER_CONSTRUCTOR_OPTIONS}
    builder = MineBuilder(mine, **builder_options)
    try:
        method = getattr(builder, task)
    except AttributeError:
        click.echo("No task named: " + task, err=True)
        return

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
        method(source)
    elif task == "integrate":
        if not options["source"]:
            click.echo(task + " task requires --source", err=True)
            return
        method(options["source"], **options)
    else:
        method(**options)
