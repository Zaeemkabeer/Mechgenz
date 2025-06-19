import motor.motor_asyncio
from pymongo.errors import ConnectionFailure
import logging
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDB:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb.client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_connection_string,
            serverSelectionTimeoutMS=5000
        )
        
        # Test the connection
        await mongodb.client.admin.command('ping')
        mongodb.database = mongodb.client[settings.database_name]
        
        logger.info("Successfully connected to MongoDB Atlas")
        
        # Create indexes for better performance
        collection = mongodb.database[settings.collection_name]
        await collection.create_index("email")
        await collection.create_index("created_at")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return mongodb.database