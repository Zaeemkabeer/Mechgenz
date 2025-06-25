from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv
import logging
import resend
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bson import ObjectId
import base64
import uuid
import shutil

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

# File upload configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.txt'}

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

def save_uploaded_file(file: UploadFile) -> Optional[Dict[str, str]]:
    """Save uploaded file and return file info"""
    try:
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            return None
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "original_name": file.filename,
            "saved_name": unique_filename,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "content_type": file.content_type
        }
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        return None

def get_logo_base64():
    """Get the MECHGENZ logo as base64 string for email embedding"""
    try:
        # Try to read the uploaded logo file
        logo_path = "public/WhatsApp Image 2025-06-17 at 18.18.31_1bacf306.jpg"
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
                return f"data:image/jpeg;base64,{encoded_string}"
        else:
            # Fallback to existing logo
            logo_path = "public/mechgenz-logo.jpg"
            if os.path.exists(logo_path):
                with open(logo_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode()
                    return f"data:image/jpeg;base64,{encoded_string}"
    except Exception as e:
        logger.warning(f"Could not load logo: {e}")
    return None

def create_email_template(to_name: str, reply_message: str, original_message: str) -> str:
    """Create a clean HTML email template with embedded logo"""
    
    logo_base64 = get_logo_base64()
    
    # Logo section - use embedded image if available, otherwise use styled placeholder
    if logo_base64:
        logo_html = f'''
        <div class="logo-section">
            <img src="{logo_base64}" alt="MECHGENZ Logo" style="width: 60px; height: 60px; border-radius: 12px; margin-right: 15px; object-fit: cover;">
            <div>
                <div class="company-name">MECHGENZ</div>
                <div class="company-tagline">TRADING CONTRACTING AND SERVICES</div>
            </div>
        </div>
        '''
    else:
        logo_html = '''
        <div class="logo-section">
            <div class="logo-placeholder">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.3)"/>
                    <path d="M8 12h6l3 8 3-8h6l3 8 3-8h6M8 28h24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div>
                <div class="company-name">MECHGENZ</div>
                <div class="company-tagline">TRADING CONTRACTING AND SERVICES</div>
            </div>
        </div>
        '''
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply from MECHGENZ</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f8f9fa;
            }}
            
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            
            .header {{
                background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }}
            
            .logo-section {{
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
            }}
            
            .logo-placeholder {{
                width: 60px;
                height: 60px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
            }}
            
            .company-name {{
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 2px;
                margin-bottom: 5px;
            }}
            
            .company-tagline {{
                font-size: 12px;
                letter-spacing: 3px;
                opacity: 0.9;
                font-weight: 500;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .greeting {{
                font-size: 24px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
            }}
            
            .reply-section {{
                background-color: #f8f9fa;
                border-left: 4px solid #ff5722;
                padding: 25px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }}
            
            .reply-message {{
                font-size: 16px;
                line-height: 1.8;
                color: #2c3e50;
                white-space: pre-line;
            }}
            
            .original-message-section {{
                margin-top: 30px;
                padding: 20px;
                background-color: #f1f3f4;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }}
            
            .original-message-title {{
                font-size: 14px;
                font-weight: 600;
                color: #666;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            
            .original-message {{
                font-size: 14px;
                color: #555;
                line-height: 1.6;
                white-space: pre-line;
                font-style: italic;
            }}
            
            .contact-info {{
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }}
            
            .contact-title {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
            }}
            
            .contact-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }}
            
            .contact-item {{
                text-align: left;
            }}
            
            .contact-label {{
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #ff5722;
                margin-bottom: 5px;
            }}
            
            .contact-value {{
                font-size: 14px;
                line-height: 1.4;
            }}
            
            .footer {{
                background-color: #1a1a1a;
                color: #cccccc;
                padding: 25px 30px;
                text-align: center;
                font-size: 12px;
            }}
            
            .footer-links {{
                margin-bottom: 15px;
            }}
            
            .footer-link {{
                color: #ff5722;
                text-decoration: none;
                margin: 0 10px;
            }}
            
            .footer-link:hover {{
                text-decoration: underline;
            }}
            
            .divider {{
                height: 1px;
                background: linear-gradient(to right, transparent, #ff5722, transparent);
                margin: 30px 0;
            }}
            
            @media (max-width: 600px) {{
                .email-container {{
                    margin: 0;
                    box-shadow: none;
                }}
                
                .content {{
                    padding: 30px 20px;
                }}
                
                .contact-info {{
                    padding: 25px 20px;
                }}
                
                .company-name {{
                    font-size: 24px;
                }}
                
                .greeting {{
                    font-size: 20px;
                }}
                
                .logo-section {{
                    flex-direction: column;
                    text-align: center;
                }}
                
                .logo-section img,
                .logo-placeholder {{
                    margin-right: 0;
                    margin-bottom: 10px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header Section -->
            <div class="header">
                {logo_html}
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Dear {to_name},</div>
                
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    Thank you for reaching out to MECHGENZ Trading Contracting & Services. We appreciate your interest in our services and are pleased to respond to your inquiry.
                </p>
                
                <div class="reply-section">
                    <div class="reply-message">{reply_message}</div>
                </div>
                
                <div class="divider"></div>
                
                <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                    We look forward to the opportunity to work with you and provide exceptional service that meets your project requirements.
                </p>
                
                <div class="original-message-section">
                    <div class="original-message-title">Your Original Message</div>
                    <div class="original-message">{original_message}</div>
                </div>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <div class="contact-title">Contact Information</div>
                
                <div class="contact-grid">
                    <div class="contact-item">
                        <div class="contact-label">Office Address</div>
                        <div class="contact-value">
                            31st Floor, Office #312<br>
                            Marina Twin Towers, Tower B<br>
                            P.O. Box 12784, Lusail, Qatar
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Phone Numbers</div>
                        <div class="contact-value">
                            +974 44117639<br>
                            +974 44374547<br>
                            +974 30401080
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Email Addresses</div>
                        <div class="contact-value">
                            info@mechgenz.com<br>
                            mishal.basheer@mechgenz.com
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-label">Managing Director</div>
                        <div class="contact-value">Mishal Basheer</div>
                    </div>
                </div>
                
                <p style="font-size: 14px; margin-top: 20px; opacity: 0.9;">
                    Visit our website: <a href="https://www.mechgenz.com" style="color: #ff5722;">www.mechgenz.com</a>
                </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-links">
                    <a href="https://www.mechgenz.com" class="footer-link">Website</a>
                    <a href="mailto:info@mechgenz.com" class="footer-link">Email</a>
                    <a href="tel:+97444117639" class="footer-link">Call Us</a>
                </div>
                
                <p>&copy; 2024 MECHGENZ W.L.L. All Rights Reserved.</p>
                <p style="margin-top: 5px; font-size: 11px; opacity: 0.8;">
                    This email was sent in response to your inquiry. Please do not reply to this automated message.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_template

def send_email_reply(to_email: str, to_name: str, reply_message: str, original_message: str) -> bool:
    try:
        if not EMAIL_PASSWORD:
            logger.error("Email password not configured")
            return False
        
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = "Reply from MECHGENZ - Your Inquiry Response"
        
        # Create HTML email
        html_body = create_email_template(to_name, reply_message, original_message)
        
        # Create plain text version as fallback
        text_body = f"""
Dear {to_name},

Thank you for reaching out to MECHGENZ Trading Contracting & Services. We appreciate your interest in our services and are pleased to respond to your inquiry.

{reply_message}

We look forward to the opportunity to work with you and provide exceptional service that meets your project requirements.

Your Original Message:
{original_message}

Contact Information:
- Office: 31st Floor, Office #312, Marina Twin Towers, Tower B, P.O. Box 12784, Lusail, Qatar
- Phone: +974 30401080
- Email: info@mechgenz.com, mishal.basheer@mechgenz.com
- Managing Director: Mishal Basheer
- Website: www.mechgenz.com

Best regards,
MECHGENZ Team

© 2024 MECHGENZ W.L.L. All Rights Reserved.
        """
        
        # Attach both versions
        text_part = MIMEText(text_body, 'plain', 'utf-8')
        html_part = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
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
async def submit_contact_form(
    request: Request,
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
        
        # Process uploaded files
        uploaded_files = []
        for file in files:
            if file.filename:  # Check if file was actually uploaded
                # Check file size
                file.file.seek(0, 2)  # Seek to end
                file_size = file.file.tell()
                file.file.seek(0)  # Reset to beginning
                
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} is too large. Maximum size is 10MB.")
                
                file_info = save_uploaded_file(file)
                if file_info:
                    uploaded_files.append(file_info)
                else:
                    raise HTTPException(status_code=400, detail=f"Invalid file type for {file.filename}")
        
        submission_data = {
            "name": name,
            "phone": phone,
            "email": email,
            "message": message,
            "uploaded_files": uploaded_files,
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
            "files_uploaded": len(uploaded_files),
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

@app.get("/api/submissions/{submission_id}/file/{file_name}")
async def download_file(submission_id: str, file_name: str):
    try:
        if not is_db_connected or collection is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        # Find the submission
        submission = collection.find_one({"_id": ObjectId(submission_id)})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Find the file
        uploaded_files = submission.get("uploaded_files", [])
        file_info = None
        for file in uploaded_files:
            if file["saved_name"] == file_name:
                file_info = file
                break
        
        if not file_info:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = file_info["file_path"]
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_path,
            filename=file_info["original_name"],
            media_type=file_info["content_type"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

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