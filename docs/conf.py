"""Sphinx configuration."""

from datetime import datetime
import os

project = "intermine_compose"
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

if not on_rtd:
    import sphinx_rtd_theme

    html_theme = "sphinx_rtd_theme"
    html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
