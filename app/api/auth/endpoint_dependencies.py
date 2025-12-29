from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status

from api.auth.security import ALGORITHM
from api.core.config import settings
from api.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> User:
    """
    Dependency to retrieve the currently authenticated user based on the provided JWT token.
    This is a required dependency for endpoints that need user authentication.
    That applies to all endpoints except registration and login.

    :param credentials: HTTPAuthorizationCredentials object containing the JWT token.

    :return: The authenticated User object.
    """

    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(credentials.credentials,
                             settings.jwt_secret_key,
                             algorithms=[ALGORITHM])

        user = await User.get(payload["sub"])
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        if not user.is_active:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled")

        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
