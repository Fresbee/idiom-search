from beanie import Document, PydanticObjectId
from datetime import datetime

class RefreshToken(Document):
    """
    Defines a record in the RefreshToken collection of the MongoDB database.
    Used to store refresh tokens associated with users for authentication purposes.
    """

    user_id: PydanticObjectId
    token: str
    expires_at: datetime

    class Config:
        json_schema_extra = {
            "description": "A RefreshToken represents a long-lived token used to obtain new access tokens."
        }

    class Settings:
        name = "refresh_tokens"
