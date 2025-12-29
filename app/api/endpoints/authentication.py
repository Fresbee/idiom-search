from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone

from api.auth.security import create_access_token, create_refresh_token, hash_password, verify_password
from api.models.user import User
from api.models.refresh_token import RefreshToken
from api.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register",
             summary="Provide an email and password to create a new user account.",
             description="Upon successful registration, access and refresh tokens are issued.",
             status_code=status.HTTP_200_OK,
             response_model=TokenResponse,
             responses={status.HTTP_409_CONFLICT: {"description": "Email already registered"}})
async def register(register_request: RegisterRequest) -> TokenResponse:
    if await User.find_one({"email": register_request.email}):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(email=register_request.email, password_hash=hash_password(register_request.password), tier=register_request.service_tier)
    await user.insert()

    return await issue_tokens(user)


@router.post("/login",
             summary="Provide an email and password to gain access with an existing account.",
             description="Upon successful login, access and refresh tokens are issued.",
             status_code=status.HTTP_200_OK,
             response_model=TokenResponse,
             responses={
                 status.HTTP_401_UNAUTHORIZED: {"description": "Invalid credentials"},
                 status.HTTP_403_FORBIDDEN: {"description": "User account is disabled"}
             })
async def login(data: LoginRequest) -> TokenResponse:
    user = await User.find_one({"email": data.username})

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "User account is disabled")

    return await issue_tokens(user)


@router.post("/refresh",
             summary="Obtain new access and refresh tokens using a valid refresh token.",
             description="Refresh tokens are long-lived and can be used to get new access tokens without re-authenticating. Previous refresh tokens are invalidated upon use.",
             status_code=status.HTTP_200_OK,
             response_model=TokenResponse,
             responses={
                 status.HTTP_400_BAD_REQUEST: {"description": "Invalid refresh token"},
                 status.HTTP_401_UNAUTHORIZED: {"description": "User not found or disabled"},
                 status.HTTP_403_FORBIDDEN: {"description": "Refresh token expired, please log in again"}
             })
async def refresh(refresh_token: str) -> TokenResponse:
    token = await RefreshToken.find_one({"token": refresh_token})
    if not token:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid refresh token")

    # Check if the token has expired and remove it if so
    if token.expires_at.astimezone(timezone.utc) < datetime.now(timezone.utc):
        await token.delete()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Refresh token expired, please log in again")

    # Delete the old token, even if still valid, to prevent reuse
    await token.delete()

    user = await User.get(token.user_id)
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or disabled")

    return await issue_tokens(user)


async def issue_tokens(user: User) -> TokenResponse:
    """
    For the given user, create and return new access and refresh tokens.

    :param user: The user for whom to issue tokens.
    """

    if not user.id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User object has no ID; user must be persisted before issuing tokens"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "scope": user.tier
    })

    refresh_token = await create_refresh_token(user.id)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
