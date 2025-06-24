from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv
import logging
import resend
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bson import ObjectId

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
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
DATABASE_NAME = "MECHGENZ"
COLLECTION_NAME = "contact_submissions"

# Resend configuration
RESEND_API_KEY = "re_G4hUh9oq_Dcaj4qoYtfWWv5saNvgG7ZEW"
COMPANY_EMAIL = "mechgenz4@gmail.com"

# Email configuration (SMTP fallback)
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "mechgenz4@gmail.com"
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Initialize Resend
resend.api_key = RESEND_API_KEY

# Global MongoDB client
mongodb_client = None
database = None
collection = None
is_db_connected = False

def connect_to_mongodb():
    global mongodb_client, database, collection, is_db_connected
    try:
        if not MONGODB_CONNECTION_STRING:
            logger.error("MongoDB connection string not found in environment variables")
            return False
        logger.info("Attempting to connect to MongoDB...")
        mongodb_client = MongoClient(MONGODB_CONNECTION_STRING)
        mongodb_client.admin.command('ping')
        database = mongodb_client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]
        is_db_connected = True
        logger.info("Successfully connected to MongoDB Atlas")
        return True
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return False
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        return False

def close_mongodb_connection():
    global mongodb_client, is_db_connected
    if mongodb_client:
        mongodb_client.close()
        is_db_connected = False
        logger.info("MongoDB connection closed")

def send_email_reply(to_email: str, to_name: str, reply_message: str, original_message: str) -> bool:
    try:
        if not EMAIL_PASSWORD:
            logger.error("Email password not configured")
            return False
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = "Reply from MECHGENZ - Your Inquiry"
        html_body = f"""
        <html><body><h2>Dear {to_name},</h2>
        <p>{reply_message.replace(chr(10), '<br>')}</p>
        <hr><p>Your Original Message:</p><p>{original_message.replace(chr(10), '<br>')}</p>
        <p>Best regards,<br>MECHGENZ Team</p></body></html>
        """
        msg.attach(MIMEText(html_body, 'html'))
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up MECHGENZ Contact Form API...")
    if not connect_to_mongodb():
        logger.warning("Failed to initialize MongoDB connection")

@app.on_event("shutdown")
async def shutdown_event():
    close_mongodb_connection()

@app.get("/")
async def root():
    return {
        "message": "MECHGENZ Contact Form API is running",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database_connected": is_db_connected
    }

@app.get("/health")
async def health_check():
    try:
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
            "email_configured": EMAIL_PASSWORD is not None
        }
    except Exception as e:
        return JSONResponse(status_code=503, content={
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        })

@app.post("/api/contact")
async def submit_contact_form(request: Request):
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
        form_data = await request.json()
        if not form_data:
            raise HTTPException(status_code=400, detail="No data provided")
        submission_data = {
            **form_data,
            "submitted_at": datetime.utcnow(),
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "status": "new"
        }
        result = collection.insert_one(submission_data)
        return {
            "success": True,
            "message": "Contact form submitted successfully",
            "submission_id": str(result.inserted_id),
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/send-reply")
async def send_reply_email(request: Request):
    try:
        data = await request.json()
        for field in ['to_email', 'to_name', 'reply_message', 'original_message']:
            if field not in data or not data[field]:
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")
        if not EMAIL_PASSWORD:
            raise HTTPException(status_code=503, detail="EMAIL_PASSWORD not configured")
        if send_email_reply(
            to_email=data['to_email'],
            to_name=data['to_name'],
            reply_message=data['reply_message'],
            original_message=data['original_message']
        ):
            return {"success": True, "message": "Email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/api/submissions")
async def get_submissions(limit: Optional[int] = 50, skip: Optional[int] = 0, status: Optional[str] = None):
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database not available")
        query_filter = {"status": status} if status else {}
        cursor = collection.find(query_filter).sort("submitted_at", -1).skip(skip).limit(limit)
        submissions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if "submitted_at" in doc:
                doc["submitted_at"] = doc["submitted_at"].isoformat()
            submissions.append(doc)
        total_count = collection.count_documents(query_filter)
        return {
            "success": True,
            "submissions": submissions,
            "total_count": total_count,
            "returned_count": len(submissions),
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving submissions: {str(e)}")

@app.put("/api/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, request: Request):
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database not available")
        data = await request.json()
        new_status = data.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        result = collection.update_one({"_id": ObjectId(submission_id)}, {"$set": {"status": new_status, "updated_at": datetime.utcnow()}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        return {
            "success": True,
            "message": "Status updated",
            "submission_id": submission_id,
            "new_status": new_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@app.get("/api/stats")
async def get_submission_stats():
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database not available")
        total_submissions = collection.count_documents({})
        pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
        status_stats = list(collection.aggregate(pipeline))
        recent_submissions = collection.count_documents({"submitted_at": {"$gte": datetime.utcnow() - timedelta(days=30)}})
        return {
            "success": True,
            "stats": {
                "total_submissions": total_submissions,
                "recent_submissions_30_days": recent_submissions,
                "status_breakdown": status_stats
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"success": False, "error": "Endpoint not found"})

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(status_code=500, content={"success": False, "error": "Internal server error"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
