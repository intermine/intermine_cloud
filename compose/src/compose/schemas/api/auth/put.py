"""Auth API PUT schema."""
from typing import Optional

from pydantic import BaseModel


class AuthPUTRequest(BaseModel):
    """Auth PUT request schema."""

    email: str
    password_reset_token: Optional[str]
    new_password: Optional[str]
