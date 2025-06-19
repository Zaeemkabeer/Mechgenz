import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    mongodb_connection_string: str = os.getenv("MONGODB_CONNECTION_STRING", "")
    database_name: str = os.getenv("DATABASE_NAME", "mechgenz_db")
    collection_name: str = os.getenv("COLLECTION_NAME", "contact_submissions")
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    
    class Config:
        env_file = ".env"

settings = Settings()