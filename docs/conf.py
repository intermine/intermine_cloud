"""Sphinx configuration."""

from datetime import datetime
import os

project = "Intermine Cloud"
author = "InterMine Developers"
copyright = f"{datetime.now().year}, {author}"
extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx_autodoc_typehints",
    "sphinx_rtd_theme",
]

html_static_path = ["_static"]
templates_path = ["_templates"]

# The name of the Pygments (syntax highlighting) style to use.
pygments_style = "sphinx"

# -- Options for HTML output ----------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.

# This allows sphinx_rtd_theme to work locally
on_rtd = os.environ.get("READTHEDOCS", None) == "True"

html_context = {
    "on_rtd": on_rtd,
    "display_github": True,
    "github_user": "intermine",
    "github_repo": "intermine_cloud",
    "github_version": "master/docs/",
}

html_theme = "furo"

# Adapted from https://github.com/pypa/setuptools/blob/main/docs/conf.py
html_theme_options = {
    "sidebar_hide_name": True,
    "light_css_variables": {
        "color-brand-primary": "#336790",  # "blue"
        "color-brand-content": "#336790",
    },
    "dark_css_variables": {
        "color-brand-primary": "#E5B62F",  # "yellow"
        "color-brand-content": "#E5B62F",
    },
}
