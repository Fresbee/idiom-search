from pydantic_settings import BaseSettings
import os

db_port = os.environ["MONGO_HOST_PORT"]
db_username = os.environ["MONGO_APP_USER"]
db_password = os.environ["MONGO_APP_PASSWORD"]
target_db_name = os.environ["MONGO_APP_DB"]

class Settings(BaseSettings):
    mongo_database_connection_uri: str = f"mongodb://{db_username}:{db_password}@mongodb:{db_port}?authSource={target_db_name}"
    mongodb_db: str = target_db_name

settings = Settings()
