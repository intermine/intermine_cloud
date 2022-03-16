"""
Install a custom build of InterMine, to be used for building a mine instead of
a version from the Maven repository.
"""
import subprocess

import click

IM_INSTALL_DIRS = [['plugin'], ['intermine'], ['bio'],
                   ['bio', 'sources'], ['bio', 'postprocess']]

IM_VERSION_PATH = ['intermine', 'build.gradle']
BIO_VERSION_PATH = ['bio', 'build.gradle']


def install(intermine_path):
    click.echo("Building InterMine...")

    for install_dir in IM_INSTALL_DIRS:
        click.echo("Installing " + '/'.join(install_dir))

        subprocess.run(['sh', 'gradlew', 'clean'],
                       check=True,
                       cwd=intermine_path.joinpath(*install_dir))
        subprocess.run(['sh', 'gradlew', 'install'],
                       check=True,
                       cwd=intermine_path.joinpath(*install_dir))
