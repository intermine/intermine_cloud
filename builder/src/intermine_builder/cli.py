"""CLI interface to builder."""

import click

from intermine_builder import MineBuilder

# TODO make one click command for each? Or try to collect as many in one command function as practical?


@click.command('create_properties_file')
@click.argument('mine')
@click.option('--overrides-properties')  # TODO .properties file to override defaults
def create_properties_file(**options):
    return


@click.command('add_data_source')
@click.argument('mine')
@click.option('--name', required=True)
@click.option('--type', required=True)
@click.option('--property', required=True, multiple=True)
# --properties 'src.data.dir=/data/panther,panther.organisms=7227 6239 9606'
# --properties 'name=src.data.dir,location=/data/panther;name=panther.organisms,value=7227 6239 9606'
# --property 'name=src.data.dir,location=/data/panther'
# --property 'name=panther.organisms,value=7227 6239 9606'
def add_data_source(**options):
    click.echo(options['property'])
    # builder = MineBuilder(options['mine'])
    # if 'properties' in options:
    #     options['properties'].split(',')


@click.command()
# @click.group(invoke_without_command=True)
# @click.argument('all_args', nargs=-1)
@click.argument('mine')
@click.argument('task')
@click.option('--build-image', is_flag=True)
@click.option('--data-path', type=click.Path(exists=True))
@click.option('--source')
@click.option('--action')
@click.option('--stacktrace', is_flag=True)
@click.pass_context
def main(ctx, **options):
    if options['task'] == 'add_data_source':
        return add_data_source.invoke(ctx)
    return

    builder = MineBuilder(options['mine'])
    try:
        method = getattr(builder, options['task'])
    except AttributeError:
        click.echo("No task named: " + options['task'], err=True)

    method(**options)


# main.add_command(create_properties_file)
# main.add_command(add_data_source)
