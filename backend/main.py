from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any, Optional
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://mechgenz:mechgenz123@cluster0.gy3n6eu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = "MECHGENZ"
COLLECTION_NAME = "contact_submissions"

# Global variables for database
mongodb_client: AsyncIOMotorClient = None
database = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app with lifespan
app = FastAPI(
    title="MECHGENZ Contact API",
    description="API for handling contact form submissions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class ContactSubmission(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the contact")
    email: EmailStr = Field(..., description="Valid email address")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    message: str = Field(..., min_length=1, max_length=2000, description="Contact message")
    company: Optional[str] = Field(None, max_length=100, description="Company name")
    subject: Optional[str] = Field(None, max_length=200, description="Message subject")

class ContactResponse(BaseModel):
    success: bool
    message: str
    submission_id: Optional[str] = None

# Database connection functions
async def connect_to_mongo():
    """Create database connection"""
    global mongodb_client, database
    try:
        mongodb_client = AsyncIOMotorClient(MONGODB_URL)
        database = mongodb_client[DATABASE_NAME]
        
        # Test the connection
        await mongodb_client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas")
        
        # Create index on email and timestamp for better performance
        collection = database[COLLECTION_NAME]
        await collection.create_index("email")
        await collection.create_index("created_at")
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("Disconnected from MongoDB")

# API Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "MECHGENZ Contact API is running",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check including database connectivity"""
    try:
        # Test database connection
        await mongodb_client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "api_status": "healthy",
        "database_status": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact_form(submission: ContactSubmission):
    """
    Submit a contact form
    
    This endpoint accepts contact form data and stores it in MongoDB.
    The data is stored dynamically without a strict schema.
    """
    try:
        # Convert Pydantic model to dict and add metadata
        submission_data = submission.dict()
        submission_data.update({
            "created_at": datetime.utcnow(),
            "status": "new",
            "source": "website_contact_form",
            "ip_address": None,  # You can capture this from request if needed
            "user_agent": None   # You can capture this from request if needed
        })
        
        # Insert into MongoDB
        collection = database[COLLECTION_NAME]
        result = await collection.insert_one(submission_data)
        
        logger.info(f"Contact form submitted successfully. ID: {result.inserted_id}")
        
        return ContactResponse(
            success=True,
            message="Thank you for your inquiry! We will get back to you soon.",
            submission_id=str(result.inserted_id)
        )
        
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your submission. Please try again later."
        )

@app.post("/api/contact/dynamic")
async def submit_dynamic_form(form_data: Dict[str, Any]):
    """
    Submit any form data dynamically
    
    This endpoint accepts any JSON data and stores it as-is in MongoDB.
    Useful for forms with varying fields or custom form structures.
    """
    try:
        # Validate that we have at least an email field
        if "email" not in form_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email field is required"
            )
        
        # Add metadata to the form data
        form_data.update({
            "created_at": datetime.utcnow(),
            "status": "new",
            "source": "dynamic_form",
            "form_type": form_data.get("form_type", "unknown")
        })
        
        # Insert into MongoDB
        collection = database[COLLECTION_NAME]
        result = await collection.insert_one(form_data)
        
        logger.info(f"Dynamic form submitted successfully. ID: {result.inserted_id}")
        
        return {
            "success": True,
            "message": "Form submitted successfully!",
            "submission_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting dynamic form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your submission."
        )

@app.get("/api/submissions")
async def get_submissions(
    limit: int = 50,
    skip: int = 0,
    status_filter: Optional[str] = None
):
    """
    Get contact submissions (for admin use)
    
    Parameters:
    - limit: Number of submissions to return (default: 50, max: 100)
    - skip: Number of submissions to skip for pagination
    - status_filter: Filter by status (new, contacted, resolved, etc.)
    """
    try:
        # Limit the maximum number of results
        limit = min(limit, 100)
        
        collection = database[COLLECTION_NAME]
        
        # Build query filter
        query_filter = {}
        if status_filter:
            query_filter["status"] = status_filter
        
        # Get submissions with pagination
        cursor = collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
        submissions = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for submission in submissions:
            submission["_id"] = str(submission["_id"])
        
        # Get total count
        total_count = await collection.count_documents(query_filter)
        
        return {
            "submissions": submissions,
            "total_count": total_count,
            "returned_count": len(submissions),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error retrieving submissions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving submissions."
        )

@app.put("/api/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status_data: Dict[str, str]):
    """
    Update the status of a submission
    
    Parameters:
    - submission_id: The ID of the submission to update
    - status_data: JSON object with 'status' field
    """
    try:
        from bson import ObjectId
        
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status field is required"
            )
        
        collection = database[COLLECTION_NAME]
        
        # Update the submission
        result = await collection.update_one(
            {"_id": ObjectId(submission_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
        
        return {
            "success": True,
            "message": f"Submission status updated to '{new_status}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating submission status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the submission."
        )

# Error handlers - Fixed to return JSONResponse objects
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found.",
            "status_code": 404
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )