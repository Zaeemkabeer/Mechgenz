from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from datetime import datetime
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv
import logging
import resend

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MECHGENZ Contact Form API",
    description="Backend API for handling contact form submissions",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://your-domain.com"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

from dotenv import load_dotenv
load_dotenv()

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

DATABASE_NAME = "MECHGENZ"
COLLECTION_NAME = "contact_submissions"

# Resend configuration
RESEND_API_KEY = "re_G4hUh9oq_Dcaj4qoYtfWWv5saNvgG7ZEW"
COMPANY_EMAIL = "mechgenz4@gmail.com"

# Initialize Resend
resend.api_key = RESEND_API_KEY

# Global MongoDB client
mongodb_client = None
database = None
collection = None
is_db_connected = False

def connect_to_mongodb():
    """Initialize MongoDB connection"""
    global mongodb_client, database, collection, is_db_connected
    
    try:
        if not MONGODB_CONNECTION_STRING:
            logger.error("MongoDB connection string not found in environment variables")
            logger.info("Please create a .env file in the backend directory with MONGODB_CONNECTION_STRING")
            return False
        
        logger.info("Attempting to connect to MongoDB...")
        mongodb_client = MongoClient(MONGODB_CONNECTION_STRING)
        
        # Test the connection
        mongodb_client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas")
        
        # Get database and collection
        database = mongodb_client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]
        is_db_connected = True
        
        logger.info(f"Database: {DATABASE_NAME}, Collection: {COLLECTION_NAME}")
        return True
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        is_db_connected = False
        return False
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        is_db_connected = False
        return False

def close_mongodb_connection():
    """Close MongoDB connection"""
    global mongodb_client, is_db_connected
    if mongodb_client:
        mongodb_client.close()
        is_db_connected = False
        logger.info("MongoDB connection closed")

# Initialize MongoDB connection on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    logger.info("Starting up MECHGENZ Contact Form API...")
    success = connect_to_mongodb()
    if not success:
        logger.warning("Failed to initialize MongoDB connection - API will run but form submissions will fail")
        logger.info("To fix this:")
        logger.info("1. Create a .env file in the backend directory")
        logger.info("2. Add your MongoDB connection string: MONGODB_CONNECTION_STRING=your_connection_string")
        logger.info("3. Restart the server")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    close_mongodb_connection()

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {
        "message": "MECHGENZ Contact Form API is running",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database_connected": is_db_connected
    }

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test MongoDB connection
        if mongodb_client and is_db_connected:
            mongodb_client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "disconnected"
        
        return {
            "status": "healthy",
            "database": db_status,
            "timestamp": datetime.utcnow().isoformat(),
            "mongodb_configured": MONGODB_CONNECTION_STRING is not None,
            "resend_configured": RESEND_API_KEY is not None
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@app.post("/api/contact")
async def submit_contact_form(request: Request):
    """
    Handle contact form submissions
    Accepts any JSON payload and stores it dynamically in MongoDB
    """
    try:
        logger.info("Received contact form submission")
        
        # Check if database connection is available
        if not is_db_connected or collection is None:
            logger.error("Database connection not available")
            raise HTTPException(
                status_code=503, 
                detail="Database connection not available. Please check MongoDB configuration."
            )
        
        # Get the JSON data from request
        form_data = await request.json()
        logger.info(f"Form data received: {form_data}")
        
        # Validate that we have some data
        if not form_data:
            raise HTTPException(
                status_code=400,
                detail="No data provided in request body"
            )
        
        # Add metadata to the submission
        submission_data = {
            **form_data,  # Include all form data as-is
            "submitted_at": datetime.utcnow(),
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "status": "new"
        }
        
        logger.info(f"Attempting to insert data into MongoDB: {submission_data}")
        
        # Insert the document into MongoDB
        result = collection.insert_one(submission_data)
        
        # Log the successful submission
        logger.info(f"Contact form submitted successfully. ID: {result.inserted_id}")
        
        return {
            "success": True,
            "message": "Contact form submitted successfully",
            "submission_id": str(result.inserted_id),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except PyMongoError as e:
        logger.error(f"MongoDB error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error occurred while saving submission: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in contact form submission: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.post("/api/send-reply")
async def send_reply_email(request: Request):
    """
    Send email reply to user using Resend API
    """
    try:
        logger.info("Received email reply request")
        
        # Get the JSON data from request
        email_data = await request.json()
        logger.info(f"Email data received: {email_data}")
        
        # Validate required fields
        required_fields = ['to_email', 'to_name', 'reply_message']
        for field in required_fields:
            if not email_data.get(field):
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )
        
        to_email = email_data['to_email']
        to_name = email_data['to_name']
        reply_message = email_data['reply_message']
        original_message = email_data.get('original_message', '')
        
        # Create email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reply from MECHGENZ</title>
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .email-container {{
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    border-bottom: 3px solid #ff5722;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #ff5722;
                    letter-spacing: 2px;
                }}
                .tagline {{
                    font-size: 12px;
                    color: #666;
                    letter-spacing: 3px;
                    margin-top: 5px;
                }}
                .greeting {{
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }}
                .reply-content {{
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-left: 4px solid #ff5722;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .original-message {{
                    background-color: #f0f0f0;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    border-left: 3px solid #ccc;
                }}
                .original-message h4 {{
                    color: #666;
                    margin-top: 0;
                    font-size: 14px;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .contact-info {{
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f8f8f8;
                    border-radius: 5px;
                }}
                .contact-info h4 {{
                    color: #ff5722;
                    margin-top: 0;
                }}
                .signature {{
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #ff5722;
                    color: white;
                    border-radius: 5px;
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">MECHGENZ</div>
                    <div class="tagline">TRADING CONTRACTING AND SERVICES</div>
                </div>
                
                <div class="greeting">
                    Dear {to_name},
                </div>
                
                <p>Thank you for contacting MECHGENZ Trading Contracting & Services. We appreciate your inquiry and are pleased to respond to your message.</p>
                
                <div class="reply-content">
                    <h3 style="color: #ff5722; margin-top: 0;">Our Response:</h3>
                    <p style="white-space: pre-wrap;">{reply_message}</p>
                </div>
                
                {f'''
                <div class="original-message">
                    <h4>Your Original Message:</h4>
                    <p style="white-space: pre-wrap;">{original_message}</p>
                </div>
                ''' if original_message else ''}
                
                <div class="contact-info">
                    <h4>Contact Information</h4>
                    <p><strong>Office:</strong> 31st Floor, Office #312, Marina Twin Towers, Tower B<br>
                    P.O. Box 12784, Lusail, Qatar</p>
                    <p><strong>Phone:</strong> +974 44117639 | +974 44374547 | +974 30401080</p>
                    <p><strong>Email:</strong> info@mechgenz.com | mishal.basheer@mechgenz.com</p>
                    <p><strong>Website:</strong> www.mechgenz.com</p>
                </div>
                
                <p>If you have any further questions or need additional information, please don't hesitate to contact us. We look forward to the opportunity to work with you.</p>
                
                <div class="signature">
                    <p style="margin: 0;"><strong>Best Regards,</strong></p>
                    <p style="margin: 5px 0 0 0;">MECHGENZ Team</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px;">Trading Contracting and Services</p>
                </div>
                
                <div class="footer">
                    <p>This email was sent from MECHGENZ Trading Contracting & Services.<br>
                    © 2024 MECHGENZ W.L.L. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_content = f"""
        Dear {to_name},

        Thank you for contacting MECHGENZ Trading Contracting & Services. We appreciate your inquiry and are pleased to respond to your message.

        Our Response:
        {reply_message}

        {f"Your Original Message:\n{original_message}\n" if original_message else ""}

        Contact Information:
        Office: 31st Floor, Office #312, Marina Twin Towers, Tower B
        P.O. Box 12784, Lusail, Qatar
        Phone: +974 44117639 | +974 44374547 | +974 30401080
        Email: info@mechgenz.com | mishal.basheer@mechgenz.com
        Website: www.mechgenz.com

        If you have any further questions or need additional information, please don't hesitate to contact us. We look forward to the opportunity to work with you.

        Best Regards,
        MECHGENZ Team
        Trading Contracting and Services

        © 2024 MECHGENZ W.L.L. All Rights Reserved.
        """
        
        # Send email using Resend
        logger.info(f"Sending email to {to_email} using Resend API")
        
        params = {
            "from": f"MECHGENZ <{COMPANY_EMAIL}>",
            "to": [to_email],
            "subject": f"Re: Your Inquiry - MECHGENZ Trading Contracting & Services",
            "html": html_content,
            "text": text_content,
            "reply_to": COMPANY_EMAIL
        }
        
        email_response = resend.Emails.send(params)
        logger.info(f"Resend API response: {email_response}")
        
        if email_response and email_response.get('id'):
            logger.info(f"Email sent successfully. Resend ID: {email_response['id']}")
            return {
                "success": True,
                "message": "Email reply sent successfully",
                "email_id": email_response['id'],
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            logger.error(f"Failed to send email. Resend response: {email_response}")
            raise HTTPException(
                status_code=500,
                detail="Failed to send email. Please try again."
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error sending email reply: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email reply: {str(e)}"
        )

@app.get("/api/submissions")
async def get_submissions(
    limit: Optional[int] = 50,
    skip: Optional[int] = 0,
    status: Optional[str] = None
):
    """
    Retrieve contact form submissions (for admin use)
    Optional query parameters:
    - limit: Number of submissions to return (default: 50)
    - skip: Number of submissions to skip (default: 0)
    - status: Filter by status (e.g., 'new', 'processed')
    """
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Build query filter
        query_filter = {}
        if status:
            query_filter["status"] = status
        
        # Get submissions with pagination
        cursor = collection.find(query_filter).sort("submitted_at", -1).skip(skip).limit(limit)
        submissions = []
        
        for doc in cursor:
            # Convert ObjectId to string for JSON serialization
            doc["_id"] = str(doc["_id"])
            # Convert datetime to ISO string
            if "submitted_at" in doc:
                doc["submitted_at"] = doc["submitted_at"].isoformat()
            submissions.append(doc)
        
        # Get total count
        total_count = collection.count_documents(query_filter)
        
        return {
            "success": True,
            "submissions": submissions,
            "total_count": total_count,
            "returned_count": len(submissions),
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except PyMongoError as e:
        logger.error(f"MongoDB error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while retrieving submissions"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@app.put("/api/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, request: Request):
    """
    Update the status of a specific submission
    """
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get the new status from request body
        data = await request.json()
        new_status = data.get("status")
        
        if not new_status:
            raise HTTPException(
                status_code=400,
                detail="Status field is required"
            )
        
        # Update the submission
        from bson import ObjectId
        result = collection.update_one(
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
                status_code=404,
                detail="Submission not found"
            )
        
        return {
            "success": True,
            "message": "Submission status updated successfully",
            "submission_id": submission_id,
            "new_status": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating submission status: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating submission status"
        )

@app.get("/api/stats")
async def get_submission_stats():
    """
    Get statistics about form submissions
    """
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get total submissions
        total_submissions = collection.count_documents({})
        
        # Get submissions by status
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        status_stats = list(collection.aggregate(pipeline))
        
        # Get submissions by date (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_submissions = collection.count_documents({
            "submitted_at": {"$gte": thirty_days_ago}
        })
        
        return {
            "success": True,
            "stats": {
                "total_submissions": total_submissions,
                "recent_submissions_30_days": recent_submissions,
                "status_breakdown": status_stats
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting submission stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving statistics"
        )

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "Endpoint not found",
            "message": "The requested endpoint does not exist"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred"
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