from beanie import Document
from enum import Enum
from pydantic import EmailStr

class ApiServiceTier(str, Enum):
    """
    Defines the different API access tiers available to users.
    This provides a way to categorize users based on their subscription level.
    Certain endpoints may have access restrictions based on these tiers.
    """

    free = "free"
    premium = "premium"
    admin = "admin"

class User(Document):
    """
    Defines a record in the User collection of the MongoDB database.
    """

    email: EmailStr
    password_hash: str
    tier: ApiServiceTier = ApiServiceTier.free
    is_active: bool = True

    class Config:
        json_schema_extra = {
            "description": "A User represents a person who has an account in the system."
        }

    class Settings:
        name = "users"
        indexes = ["email"]
