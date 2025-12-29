from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from beanie import PydanticObjectId
from jose import jwt
from passlib.context import CryptContext

from api.core.config import settings
from api.models.refresh_token import RefreshToken

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def normalize_password(password: str) -> bytes:
    """
    Normalizes the password by encoding it to UTF-8 and hashing it using SHA-256.
    This ensures consistent password representation before hashing with bcrypt.
    """

    return hashlib.sha256(password.encode("utf-8")).digest()


def hash_password(password: str) -> str:
    """
    Creates a hashed version of the provided password using bcrypt.
    This ensures that plain-text passwords are not stored directly, enhancing security.
    With the password normalized, any length password can be securely hashed.

    :param password: The plain-text password to be hashed.

    :return: The hashed password as a string.
    """

    return pwd_context.hash(normalize_password(password))


def verify_password(password: str, hash: str) -> bool:
    """
    Verifies a plain-text password against its hashed version.
    This is used during authentication to confirm that the provided password matches the stored hash.
    With the password normalized, any length password can be securely verified.

    :param password: The plain-text password to verify.
    :param hash: The hashed password to compare against.

    :return: True if the password matches the hash, False otherwise.
    """

    return pwd_context.verify(normalize_password(password), hash)


def create_access_token(data: dict) -> str:
    """
    Creates an access token using JWT. This is a short-lived token used for authenticating user requests.

    :param data: The data to include in the token.

    :return: The encoded JWT token.
    """

    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)

async def create_refresh_token(user_id: PydanticObjectId) -> str:
    """
    Creates a secure refresh token. This is a long-lived token used to obtain new access tokens without re-authenticating.

    :param user_id: The ID of the user for whom the refresh token is being created.

    :return: A URL-safe base64-encoded refresh token string.
    """

    refresh_token_value = secrets.token_urlsafe(32)
    await RefreshToken(
        user_id=user_id,
        token=refresh_token_value,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    ).insert()

    return refresh_token_value
