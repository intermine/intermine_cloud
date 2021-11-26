"""Cookie templater."""

from pathlib import Path
from typing import Optional

from cookiecutter.main import cookiecutter

from compose.schemas.template import Template, TemplateContext


class CookieTemplater:
    """Cookie templater."""

    def render(
        self: "CookieTemplater",
        template: Template,
        context: TemplateContext,
        output_dir: Optional[Path],
    ) -> Path:
        """Generate files using the uploaded template and input.

        Args:
            template (Template): Template object
            context (TemplateContext): Render context
            output_dir (Optional[Path]): Path to output dir

        Returns: # noqa: DAR202
            Path: [description]
        """
        cookiecutter()
