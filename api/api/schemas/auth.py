from pydantic import BaseModel, EmailStr, Field

from api.models.user import ApiServiceTier

class RegisterRequest(BaseModel):
    """
    Schema for user registration and login requests.
    Contains a user's email and password fields required for authentication.
    """

    email: EmailStr = Field(description="a user email address associated with the account", examples=["john.doe@example.com"])
    password: str = Field(description="a user's secret password", examples=["12345678"])
    service_tier: ApiServiceTier = Field(default=ApiServiceTier.free,
                                         description="the API access tier for the user account",
                                         examples=[ApiServiceTier.free, ApiServiceTier.premium, ApiServiceTier.admin])

class LoginRequest(BaseModel):
    """
    Schema for user login requests.
    Contains a user's email and password fields required for authentication.
    """

    username: EmailStr = Field(description="a user email address associated with the account", examples=["john.doe@example.com"])
    password: str = Field(description="a user's secret password", examples=["12345678"])

class TokenResponse(BaseModel):
    """
    Schema for responses containing access and refresh tokens.
    """

    access_token: str = Field(description="access token")
    refresh_token: str = Field(description="refresh token")
    token_type: str = "bearer"
