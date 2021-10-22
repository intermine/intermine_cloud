"""Template utility functions."""

from pathlib import Path
from shutil import make_archive

from compose.schemas.template import Template


def create_template_from_dir(dir_path: Path) -> Template:
    """Helper to create Template from Dir path"""
    filename = make_archive("template", "zip", dir_path)
