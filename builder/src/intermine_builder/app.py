"""Web server for InterMine builder."""

import pathlib
import sys

from flask import Flask
import logzero

from intermine_builder import build


def main() -> None:
    """Start InterMine builder web server and build process."""
    logzero.logfile(pathlib.Path.cwd() / "builder.log", maxBytes=1e6, backupCount=3)

    Flask(__name__)

    if len(sys.argv) > 1:
        # Invoked with path to JSON file.
        build.start(file=sys.argv[1])
    else:
        build.start()
