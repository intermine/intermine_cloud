"""Cookie templater."""

from pathlib import Path
from typing import Optional

from compose.schemas.template import Template, TemplateContext

from cookiecutter.main import cookiecutter


class CookieTemplater:
    "Cookie templater."

    def render(
        self: "CookieTemplater",
        template: Template,
        context: TemplateContext,
        output_dir: Optional[Path],
    ) -> Path:
        """Generate files using the uploaded template and input."""
        cookiecutter()
