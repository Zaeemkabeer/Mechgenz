from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from datetime import datetime
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging
import resend
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

DATABASE_NAME = "MECHGENZ"
COLLECTION_NAME = "contact_submissions"

# Resend configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "re_G4hUh9oq_Dcaj4qoYtfWWv5saNvgG7ZEW")
COMPANY_EMAIL = os.getenv("REPLY_FROM_EMAIL", "mechgenz4@gmail.com")
VERIFIED_DOMAIN = os.getenv("VERIFIED_DOMAIN", None)  # Set this to your verified domain

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    logger.info("Starting up MECHGENZ Contact Form API...")
    success = connect_to_mongodb()
    if not success:
        logger.warning("Failed to initialize MongoDB connection - API will run but form submissions will fail")
        logger.info("To fix this:")
        logger.info("1. Create a .env file in the backend directory")
        logger.info("2. Add your MongoDB connection string: MONGODB_CONNECTION_STRING=your_connection_string")
        logger.info("3. Restart the server")
    
    yield
    
    # Shutdown
    close_mongodb_connection()

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="MECHGENZ Contact Form API",
    description="Backend API for handling contact form submissions",
    version="1.0.0",
    lifespan=lifespan
)

# Get CORS origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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

async def send_notification_email(form_data):
    """Send notification email to company when a new contact form is submitted"""
    try:
        # Create email content for company notification
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission - MECHGENZ</title>
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
                .alert {{
                    background-color: #ff5722;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: bold;
                }}
                .form-data {{
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-left: 4px solid #ff5722;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .field {{
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }}
                .field:last-child {{
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }}
                .field-label {{
                    font-weight: bold;
                    color: #ff5722;
                    margin-bottom: 5px;
                }}
                .field-value {{
                    color: #333;
                    white-space: pre-wrap;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .action-buttons {{
                    text-align: center;
                    margin: 30px 0;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 20px;
                    margin: 5px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    color: white;
                }}
                .btn-primary {{
                    background-color: #ff5722;
                }}
                .btn-secondary {{
                    background-color: #2c3e50;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">MECHGENZ</div>
                    <div class="tagline">TRADING CONTRACTING AND SERVICES</div>
                </div>
                
                <div class="alert">
                    🔔 NEW CONTACT FORM SUBMISSION
                </div>
                
                <p>A new contact form has been submitted on the MECHGENZ website. Here are the details:</p>
                
                <div class="form-data">
                    <div class="field">
                        <div class="field-label">Full Name:</div>
                        <div class="field-value">{form_data.get('name', 'Not provided')}</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Phone Number:</div>
                        <div class="field-value">{form_data.get('phone', 'Not provided')}</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Email Address:</div>
                        <div class="field-value">{form_data.get('email', 'Not provided')}</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Message:</div>
                        <div class="field-value">{form_data.get('message', 'Not provided')}</div>
                    </div>
                </div>
                
                <p><strong>Submitted at:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                
                <div class="action-buttons">
                    <a href="http://localhost:5173/admin/user-inquiries" class="btn btn-primary">
                        🖥️ View in Admin Panel
                    </a>
                    <a href="mailto:{form_data.get('email', '')}?subject=Re: Your inquiry to MECHGENZ" class="btn btn-secondary">
                        ↩️ Reply Directly
                    </a>
                </div>
                
                <p>Please respond to this inquiry as soon as possible.</p>
                
                <div class="footer">
                    <p>This notification was sent automatically from the MECHGENZ website contact form.<br>
                    © 2024 MECHGENZ W.L.L. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send notification email to company - USING VERIFIED DOMAIN
        params = {
            "from": "MECHGENZ Website <info@mechgenz.com>",  # ✅ Using verified domain
            "to": [COMPANY_EMAIL],  # Admin will receive at mechgenz4@gmail.com
            "subject": f"🔔 New Contact Form Submission from {form_data.get('name', 'Unknown')}",
            "html": html_content,
            "reply_to": form_data.get('email', COMPANY_EMAIL)  # User can reply back
        }
        
        email_response = resend.Emails.send(params)
        logger.info(f"Notification email sent successfully. Resend ID: {email_response.get('id', 'Unknown')}")
        
    except Exception as e:
        logger.error(f"Failed to send notification email: {e}")
        # Don't raise the exception - we don't want email failures to break form submission

@app.post("/api/send-reply")
async def send_reply_email(request: Request):
    """
    Send email reply directly to user from admin
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
        
        # Create professional reply email content for the user
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
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
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
                
                <div class="greeting">Dear {to_name},</div>
                
                <p>Thank you for contacting MECHGENZ Trading Contracting & Services. We appreciate your inquiry and are pleased to respond to your message.</p>
                
                <div class="reply-content">
                    <h3 style="color: #ff5722; margin-top: 0;">Our Response:</h3>
                    <p style="margin-bottom: 0; white-space: pre-line;">{reply_message}</p>
                </div>
                
                {f'''
                <div class="original-message">
                    <h4>Your Original Message:</h4>
                    <p style="margin-bottom: 0; font-style: italic; white-space: pre-line;">{original_message}</p>
                </div>
                ''' if original_message else ''}
                
                <p>If you have any further questions or need additional information, please don't hesitate to contact us. We look forward to the opportunity to work with you.</p>
                
                <div class="contact-info">
                    <h4>Contact Information</h4>
                    <p><strong>Office:</strong> Buzwair Complex, 4th Floor, Rawdat Al Khail St, Doha Qatar<br>
                    <strong>P.O. Box:</strong> 22911</p>
                    <p><strong>Phone:</strong> +974 30401080</p>
                    <p><strong>Email:</strong> info@mechgenz.com | mishal.basheer@mechgenz.com</p>
                    <p><strong>Website:</strong> www.mechgenz.com</p>
                    <p><strong>Managing Director:</strong> Mishal Basheer</p>
                </div>
                
                <div class="signature">
                    <p style="margin: 0;"><strong>Best Regards,<br>
                    MECHGENZ Team<br>
                    Trading Contracting and Services</strong></p>
                </div>
                
                <div class="footer">
                    <p>© 2024 MECHGENZ W.L.L. All Rights Reserved.</p>
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

        {f"Your Original Message:\\n{original_message}\\n" if original_message else ""}

        If you have any further questions or need additional information, please don't hesitate to contact us. We look forward to the opportunity to work with you.

        Contact Information:
        Office: Buzwair Complex, 4th Floor, Rawdat Al Khail St, Doha Qatar
        P.O. Box: 22911
        Phone: +974 30401080
        Email: info@mechgenz.com | mishal.basheer@mechgenz.com
        Website: www.mechgenz.com
        Managing Director: Mishal Basheer

        Best Regards,
        MECHGENZ Team
        Trading Contracting and Services

        © 2024 MECHGENZ W.L.L. All Rights Reserved.
        """
        
        # Send email directly to the user using Resend - USING VERIFIED DOMAIN
        logger.info(f"Sending reply email directly to user {to_name} ({to_email}) using Resend API")
        
        params = {
            "from": "MECHGENZ <info@mechgenz.com>",  # ✅ Using verified domain
            "to": [to_email],  # Send directly to the user
            "subject": f"Reply from MECHGENZ - Your Inquiry",
            "html": html_content,
            "text": text_content,
            "reply_to": COMPANY_EMAIL  # User can reply back to mechgenz4@gmail.com
        }
        
        email_response = resend.Emails.send(params)
        logger.info(f"Resend API response: {email_response}")
        
        if email_response and email_response.get('id'):
            logger.info(f"Reply email sent successfully to {to_email}. Resend ID: {email_response['id']}")
            return {
                "success": True,
                "message": f"Reply sent successfully to {to_name} ({to_email})",
                "email_id": email_response['id'],
                "customer_email": to_email,
                "customer_name": to_name,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            logger.error(f"Failed to send reply email. Resend response: {email_response}")
            raise HTTPException(
                status_code=500,
                detail="Failed to send reply email. Please try again."
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error sending reply email: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send reply email: {str(e)}"
        )

@app.post("/api/contact")
async def submit_contact_form(request: Request):
    """
    Handle contact form submissions with optional file uploads
    Accepts FormData with form fields and files
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
        
        # Parse FormData
        form = await request.form()
        logger.info(f"Form data received: {dict(form)}")
        
        # Extract form fields
        form_data = {}
        files_info = []
        
        for key, value in form.items():
            if key == 'files':
                # Handle file uploads
                if hasattr(value, 'filename'):  # It's a file
                    files_info.append({
                        'filename': value.filename,
                        'content_type': value.content_type,
                        'size': len(await value.read()) if hasattr(value, 'read') else 0
                    })
                    # Reset file pointer if possible
                    if hasattr(value, 'seek'):
                        await value.seek(0)
            else:
                # Regular form field
                form_data[key] = value
        
        # Validate that we have required data
        required_fields = ['name', 'email', 'message']
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        logger.info(f"Processed form data: {form_data}")
        logger.info(f"Files info: {files_info}")
        
        # Add metadata to the submission
        submission_data = {
            **form_data,  # Include all form data as-is
            "files_info": files_info,  # Store file information
            "submitted_at": datetime.utcnow(),
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "status": "new"
        }
        
        logger.info(f"Submission data to be stored: {submission_data}")
        
        # Store in MongoDB
        try:
            result = collection.insert_one(submission_data)
            logger.info(f"Successfully stored submission with ID: {result.inserted_id}")
        except PyMongoError as e:
            logger.error(f"MongoDB error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Database error occurred while storing submission"
            )
        
        # Send notification email to company
        try:
            await send_notification_email(form_data)
            logger.info("Notification email sent successfully")
        except Exception as e:
            logger.error(f"Failed to send notification email: {e}")
            # Don't fail the entire request if email fails
        
        return {
            "success": True,
            "message": "Contact form submitted successfully",
            "submission_id": str(result.inserted_id),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (they already have proper status codes)
        raise
    except PyMongoError as e:
        logger.error(f"MongoDB error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while processing submission"
        )
    except Exception as e:
        logger.error(f"Unexpected error in submit_contact_form: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your submission"
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