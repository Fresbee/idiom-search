from pymongo import AsyncMongoClient
from beanie import init_beanie

from api.core.config import settings
from api.models.idiom import Idiom
from api.models.refresh_token import RefreshToken
from api.models.user import User

client: AsyncMongoClient | None = None

async def init_db():
    global client
    client = AsyncMongoClient(settings.mongo_database_connection_uri)

    await init_beanie(
        database=client[settings.mongodb_db],
        document_models=[
            Idiom,
            RefreshToken,
            User
        ]
    )


async def close_db():
    global client
    if client:
        await client.close()
