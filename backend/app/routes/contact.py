from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from ..models import ContactSubmission, ContactResponse, ContactListResponse
from ..database import get_database
from ..config import settings

router = APIRouter(prefix="/api/contact", tags=["Contact"])
logger = logging.getLogger(__name__)

@router.post("/submit", response_model=ContactResponse)
async def submit_contact_form(submission: ContactSubmission):
    """
    Submit a new contact form
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Convert Pydantic model to dict
        submission_dict = submission.dict()
        
        # Insert the document
        result = await collection.insert_one(submission_dict)
        
        if result.inserted_id:
            logger.info(f"New contact submission created with ID: {result.inserted_id}")
            return ContactResponse(
                success=True,
                message="Thank you for your inquiry! We will get back to you soon.",
                submission_id=str(result.inserted_id)
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to save submission")
            
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="A submission with this email already exists")
    except Exception as e:
        logger.error(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.get("/submissions", response_model=ContactListResponse)
async def get_contact_submissions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name, email, or message")
):
    """
    Get all contact submissions with pagination and filtering
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Build query filter
        query_filter = {}
        if status:
            query_filter["status"] = status
        
        if search:
            query_filter["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"message": {"$regex": search, "$options": "i"}}
            ]
        
        # Calculate skip value for pagination
        skip = (page - 1) * limit
        
        # Get total count
        total = await collection.count_documents(query_filter)
        
        # Get submissions with pagination
        cursor = collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
        submissions = []
        
        async for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            submissions.append(doc)
        
        return ContactListResponse(
            success=True,
            total=total,
            submissions=submissions,
            page=page,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Error fetching contact submissions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.get("/submissions/{submission_id}")
async def get_contact_submission(submission_id: str):
    """
    Get a specific contact submission by ID
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Validate ObjectId format
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID format")
        
        # Find the submission
        submission = await collection.find_one({"_id": ObjectId(submission_id)})
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Convert ObjectId to string
        submission["_id"] = str(submission["_id"])
        
        return {
            "success": True,
            "submission": submission
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching contact submission: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.patch("/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status: str):
    """
    Update the status of a contact submission
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Validate ObjectId format
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID format")
        
        # Valid status values
        valid_statuses = ["new", "in_progress", "completed", "archived"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Update the submission
        result = await collection.update_one(
            {"_id": ObjectId(submission_id)},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "success": True,
            "message": f"Submission status updated to {status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating submission status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.delete("/submissions/{submission_id}")
async def delete_contact_submission(submission_id: str):
    """
    Delete a contact submission
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Validate ObjectId format
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID format")
        
        # Delete the submission
        result = await collection.delete_one({"_id": ObjectId(submission_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "success": True,
            "message": "Submission deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contact submission: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@router.get("/stats")
async def get_contact_stats():
    """
    Get contact submission statistics
    """
    try:
        database = get_database()
        if not database:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        collection = database[settings.collection_name]
        
        # Get total submissions
        total = await collection.count_documents({})
        
        # Get submissions by status
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = {}
        async for doc in collection.aggregate(pipeline):
            status_counts[doc["_id"]] = doc["count"]
        
        # Get submissions from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_count = await collection.count_documents({
            "created_at": {"$gte": thirty_days_ago}
        })
        
        return {
            "success": True,
            "stats": {
                "total_submissions": total,
                "recent_submissions": recent_count,
                "status_breakdown": status_counts
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching contact stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")