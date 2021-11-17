"""Auth API POST schema."""

from typing import List

from blackcap.schemas.user import User
from pydantic import BaseModel


class AuthPOSTResponse(BaseModel):
    """Auth POST response schema."""

    items: List[User] = []


class AuthPOSTRequest(BaseModel):
    """Auth POST request schema."""

    email: str
    password: str
