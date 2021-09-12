"""Exposes gradle commands as functions."""

import subprocess
from pathlib import Path
from typing import List

from intermine_builder.build.config import get_config


def _gradle(args_list: List[str]) -> subprocess.CompletedProcess:
    config = get_config()
    minedir = Path.home() / "intermine" / config["mine"]
    return subprocess.run(["./gradlew"] + args_list, cwd=minedir)


def deploy(
    redeploy: bool = False, stacktrace: bool = False
) -> subprocess.CompletedProcess:
    args = ["cargoRedeployRemote" if redeploy else "cargoDeployRemote"]
    if stacktrace:
        args += "--stacktrace"
    return _gradle(args)


def build_db(stacktrace: bool = False) -> subprocess.CompletedProcess:
    args = ["buildDB"]
    if stacktrace:
        args += "--stacktrace"
    return _gradle(args)


def build_user_db(stacktrace: bool = False) -> subprocess.CompletedProcess:
    args = ["buildUserDB"]
    if stacktrace:
        args += "--stacktrace"
    return _gradle(args)


def post_process(stacktrace: bool = False) -> subprocess.CompletedProcess:
    args = ["postProcess"]
    if stacktrace:
        args += "--stacktrace"
    return _gradle(args)


def integrate(source: str, stacktrace: bool = False) -> subprocess.CompletedProcess:
    args = ["integrate", "-Psource=" + source]
    if stacktrace:
        args += "--stacktrace"
    return _gradle(args)

def clean() -> subprocess.CompletedProcess:
    args = ["clean"]
    return _gradle(args)
