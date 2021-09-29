"""Maple CLI"""

# flake8: noqa

import os
from pathlib import Path
from subprocess import run
from typing import Dict

import click

from blackcap.configs import config_registry


from .. import __version__

config = config_registry.get_config()


project_root = Path(__file__).absolute().parents[4]
tools_path = project_root.joinpath("scratch", "tools")
compose_path = project_root.joinpath("compose")
demon_path = project_root.joinpath("demon")
maple_path = project_root.joinpath("maple")


def get_conda_env_dict() -> Dict:
    """Create conda env dict."""
    return {
        "CONDA_SHELL_PATH": f"{(tools_path / 'miniconda' / 'etc' / 'profile.d' / 'conda.sh')}",
        "CONDA_ENV_PATH": f"{(tools_path / 'miniconda' / 'envs' / 'imcloud')}",
        "ADD_TO_PATH": f"{(tools_path / 'miniconda' / 'envs' / 'imcloud' / 'bin')}:{(tools_path / 'miniconda' / 'condabin')}",
        "_CE_M": "",
        "_CE_CONDA": "",
        "CONDA_EXE": f"{(tools_path / 'miniconda' / 'bin' / 'conda')}",
        "CONDA_PYTHON_EXE": f"{(tools_path / 'miniconda' / 'bin' / 'conda' / 'python')}",
        "CONDA_SHLVL": "2",
        "CONDA_PREFIX": f"{(tools_path / 'miniconda' / 'envs' / 'imcloud')}",
        "CONDA_DEFAULT_ENV": "imcloud",
        "CONDA_PROMPT_MODIFIER": "(imcloud)",
        "CONDA_PREFIX_1": f"{(tools_path / 'miniconda')}",
    }


@click.command()
@click.argument("options", nargs=-1)
def flux(options) -> None:
    """FluxCD wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["flux"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'fluxcd')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def tf(options) -> None:
    """Terraform wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["terraform"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'terraform')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def gitea(options) -> None:
    """Gitea wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["gitea"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'gitea')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def kstm(options) -> None:
    """Kustomize wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["kustomize"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'kustomize')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def helm(options) -> None:
    """MinIO wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["helm"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'helm')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def k(options) -> None:
    """Kubectl wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["kubectl"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'kubectl')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def kind(options) -> None:
    """Kind wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["kind"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'kind')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def traefik(options) -> None:
    """Traefik wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["traefik"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'traefik')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def nats(options) -> None:
    """Nats wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["nats-setver"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'minio')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def mc(options) -> None:
    """MinIO Client wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["mc"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'nats')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.argument("options", nargs=-1)
def minio(options) -> None:
    """MinIO Server wrapper"""
    conda_env = get_conda_env_dict()
    cmd_arr = ["minio"] + list(options)
    run(
        cmd_arr,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'minio')}:{os.environ['PATH']}",
        },
    )


@click.command()
@click.option(
    "-d",
    type=click.Choice(["compose", "demon", "maple"], case_sensitive=False),
    required=True,
)
@click.argument("options", nargs=-1)
def poetry(d, options) -> None:
    """Poetry wrapper"""

    if d == "compose":
        d = compose_path
    elif d == "demon":
        d = demon_path
    elif d == "maple":
        d == maple_path

    conda_env = get_conda_env_dict()
    cmd_arr = ["poetry"] + list(options)
    run(
        cmd_arr,
        cwd=d,
        env={
            **os.environ,
            **conda_env,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{conda_env['ADD_TO_PATH']}:{(tools_path / 'poetry' / 'bin')}:{os.environ['PATH']}",
        },
    )


@click.group()
@click.version_option(version=__version__)
def main() -> None:
    """Maple console."""
    pass


main.add_command(poetry)
main.add_command(minio)
main.add_command(mc)
main.add_command(nats)
main.add_command(traefik)
main.add_command(kind)
main.add_command(k)
main.add_command(helm)
main.add_command(kstm)
main.add_command(tf)
main.add_command(gitea)
main.add_command(flux)
