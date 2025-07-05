import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pydantic import BaseModel, EmailStr
import resend
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection with improved error handling
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
if not MONGODB_CONNECTION_STRING:
    print("ERROR: MONGODB_CONNECTION_STRING not found in environment variables")
    print("Please check your .env file and ensure the connection string is properly set")

try:
    print(f"Attempting to connect to MongoDB Atlas...")
    print(f"Connection string: {MONGODB_CONNECTION_STRING[:50]}...")  # Only show first 50 chars for security
    
    # Configure MongoDB client with proper timeout settings for Atlas
    client = MongoClient(
        MONGODB_CONNECTION_STRING,
        serverSelectionTimeoutMS=10000,  # 10 second timeout
        connectTimeoutMS=10000,
        socketTimeoutMS=10000,
        maxPoolSize=10,
        retryWrites=True
    )
    
    # Test the connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB Atlas!")
    
    db = client["MECHGENZ"]
    contact_collection = db["contact_submissions"]
    admin_collection = db["admin_users"]
    website_images_collection = db["website_images"]
    
    print("✅ Database collections initialized successfully")
    
except ServerSelectionTimeoutError as e:
    print(f"❌ MongoDB Atlas connection timeout: {e}")
    print("Please check:")
    print("1. Your internet connection")
    print("2. MongoDB Atlas cluster is running")
    print("3. Your IP address is whitelisted in MongoDB Atlas")
    print("4. Username and password are correct")
    client = None
    db = None
    contact_collection = None
    admin_collection = None
    website_images_collection = None
except ConnectionFailure as e:
    print(f"❌ MongoDB Atlas connection failed: {e}")
    print("Please verify your connection string and network settings")
    client = None
    db = None
    contact_collection = None
    admin_collection = None
    website_images_collection = None
except Exception as e:
    print(f"❌ Unexpected error connecting to MongoDB Atlas: {e}")
    client = None
    db = None
    contact_collection = None
    admin_collection = None
    website_images_collection = None

# Resend configuration
resend.api_key = "re_G4hUh9oq_Dcaj4qoYtfWWv5saNvgG7ZEW"

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("public/images", exist_ok=True)

# Comprehensive Website Images Configuration
WEBSITE_IMAGES_CONFIG = {
    # Branding
    "logo": {
        "name": "Company Logo",
        "description": "Main company logo displayed in header and footer",
        "default_url": "/mechgenz-logo.jpg",
        "locations": ["Header", "Footer", "Admin Panel"],
        "recommended_size": "200x200px",
        "category": "branding"
    },
    
    # Hero Section
    "hero_slide_1": {
        "name": "Hero Slide 1",
        "description": "First slide in the hero carousel",
        "default_url": "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Hero Section"],
        "recommended_size": "1920x1080px",
        "category": "hero"
    },
    "hero_slide_2": {
        "name": "Hero Slide 2",
        "description": "Second slide in the hero carousel",
        "default_url": "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Hero Section"],
        "recommended_size": "1920x1080px",
        "category": "hero"
    },
    "hero_slide_3": {
        "name": "Hero Slide 3",
        "description": "Third slide in the hero carousel",
        "default_url": "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Hero Section"],
        "recommended_size": "1920x1080px",
        "category": "hero"
    },
    
    # About Section
    "about_main": {
        "name": "About Section Main Image",
        "description": "Main image displayed in the about section",
        "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["About Section"],
        "recommended_size": "800x600px",
        "category": "about"
    },
    
    # Trading Section
    "mechanical_suppliers": {
        "name": "Mechanical Suppliers Background",
        "description": "Background image for mechanical suppliers trading category",
        "default_url": "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Trading Section - Mechanical Suppliers"],
        "recommended_size": "800x600px",
        "category": "trading"
    },
    "electrical_suppliers": {
        "name": "Electrical Suppliers Background",
        "description": "Background image for electrical suppliers trading category",
        "default_url": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Trading Section - Electrical Suppliers"],
        "recommended_size": "800x600px",
        "category": "trading"
    },
    "plumbing_suppliers": {
        "name": "Plumbing Suppliers Background",
        "description": "Background image for plumbing suppliers trading category",
        "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Trading Section - Plumbing Suppliers"],
        "recommended_size": "800x600px",
        "category": "trading"
    },
    "fire_fighting_suppliers": {
        "name": "Fire Fighting Suppliers Background",
        "description": "Background image for fire fighting suppliers trading category",
        "default_url": "https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Trading Section - Fire Fighting Suppliers"],
        "recommended_size": "800x600px",
        "category": "trading"
    },
    
    # Portfolio Section
    "portfolio_civil_1": {
        "name": "Civil Structure Project 1",
        "description": "Featured civil structure project image",
        "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Civil Structure"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_civil_2": {
        "name": "Civil Structure Project 2",
        "description": "Featured civil structure project image",
        "default_url": "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Civil Structure"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_road_1": {
        "name": "Road Infrastructure Project 1",
        "description": "Featured road infrastructure project image",
        "default_url": "https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Road Infrastructure"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_road_2": {
        "name": "Road Infrastructure Project 2",
        "description": "Featured road infrastructure project image",
        "default_url": "https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Road Infrastructure"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_fitout_1": {
        "name": "Fit Out Project 1",
        "description": "Featured fit out project image",
        "default_url": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Fit Out"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_fitout_2": {
        "name": "Fit Out Project 2",
        "description": "Featured fit out project image",
        "default_url": "https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Fit Out"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_special_1": {
        "name": "Special Installation Project 1",
        "description": "Featured special installation project image",
        "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Special Installation"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    "portfolio_special_2": {
        "name": "Special Installation Project 2",
        "description": "Featured special installation project image",
        "default_url": "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
        "locations": ["Portfolio Section - Special Installation"],
        "recommended_size": "800x600px",
        "category": "portfolio"
    },
    
    # Services Section
    "services_background": {
        "name": "Services Section Background",
        "description": "Background image for services section",
        "default_url": "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Services Section"],
        "recommended_size": "1920x1080px",
        "category": "services"
    },
    
    # Contact Section
    "contact_background": {
        "name": "Contact Section Background",
        "description": "Background image for contact section",
        "default_url": "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Contact Section"],
        "recommended_size": "1920x1080px",
        "category": "contact"
    },
    
    # Team Section
    "team_member_1": {
        "name": "Team Member 1",
        "description": "Profile image for team member",
        "default_url": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
        "locations": ["Team Section"],
        "recommended_size": "400x400px",
        "category": "team"
    },
    "team_member_2": {
        "name": "Team Member 2",
        "description": "Profile image for team member",
        "default_url": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
        "locations": ["Team Section"],
        "recommended_size": "400x400px",
        "category": "team"
    },
    "team_member_3": {
        "name": "Team Member 3",
        "description": "Profile image for team member",
        "default_url": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
        "locations": ["Team Section"],
        "recommended_size": "400x400px",
        "category": "team"
    },
    
    # Testimonials Section
    "testimonial_bg": {
        "name": "Testimonials Background",
        "description": "Background image for testimonials section",
        "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "locations": ["Testimonials Section"],
        "recommended_size": "1920x1080px",
        "category": "testimonials"
    }
}

# Initialize website images in database
async def initialize_website_images():
    if website_images_collection is None:
        print("⚠️ Skipping website images initialization - database not connected")
        return
    
    try:
        print(f"🔄 Initializing {len(WEBSITE_IMAGES_CONFIG)} website images...")
        
        # Clear existing images and reinitialize to ensure consistency
        website_images_collection.delete_many({})
        
        for image_id, config in WEBSITE_IMAGES_CONFIG.items():
            image_doc = {
                "_id": image_id,
                "name": config["name"],
                "description": config["description"],
                "current_url": config["default_url"],
                "default_url": config["default_url"],
                "locations": config["locations"],
                "recommended_size": config["recommended_size"],
                "category": config["category"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            website_images_collection.insert_one(image_doc)
            print(f"✅ Initialized image: {image_id} ({config['name']})")
        
        print(f"✅ Successfully initialized {len(WEBSITE_IMAGES_CONFIG)} website images")
        
        # Verify initialization
        count = website_images_collection.count_documents({})
        print(f"📊 Total images in database: {count}")
        
    except Exception as e:
        print(f"❌ Error initializing website images: {e}")

# Initialize admin user
async def initialize_admin():
    if admin_collection is None:
        print("⚠️ Skipping admin initialization - database not connected")
        return
    
    try:
        existing_admin = admin_collection.find_one({"email": "mechgenz4@gmail.com"})
        if not existing_admin:
            admin_doc = {
                "name": "MECHGENZ Admin",
                "email": "mechgenz4@gmail.com",
                "password": "mechgenz4",  # In production, this should be hashed
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            admin_collection.insert_one(admin_doc)
            print("✅ Admin user initialized successfully")
        else:
            print("✅ Admin user already exists")
    except Exception as e:
        print(f"❌ Error initializing admin: {e}")

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting MECHGENZ API server...")
    if db is not None:
        await initialize_website_images()
        await initialize_admin()
        print("✅ Server startup completed successfully")
    else:
        print("⚠️ Server started but database is not connected")
    
    yield
    
    # Shutdown
    print("🔄 Shutting down MECHGENZ API server...")
    if client:
        client.close()
    print("✅ Server shutdown completed")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="MECHGENZ Contact Form API",
    description="API for handling contact form submissions with MongoDB and Resend integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://mechgenz.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/images", StaticFiles(directory="public/images"), name="images")

# Pydantic models
class ContactSubmission(BaseModel):
    name: str
    phone: str
    email: EmailStr
    message: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUpdate(BaseModel):
    name: str
    email: EmailStr
    currentPassword: Optional[str] = None
    password: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class EmailReply(BaseModel):
    to_email: EmailStr
    to_name: str
    reply_message: str
    original_message: str

class ImageUpdate(BaseModel):
    name: str
    description: str

# Utility functions
def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def save_uploaded_file(file: UploadFile) -> Dict[str, Any]:
    """Save uploaded file and return file info"""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("uploads", unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "original_name": file.filename,
            "saved_name": unique_filename,
            "file_size": os.path.getsize(file_path),
            "content_type": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

# Routes
@app.get("/")
async def root():
    db_status = "connected" if db is not None else "disconnected"
    return {
        "message": "MECHGENZ Contact Form API is running", 
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "healthy",
            "database": "healthy" if db is not None else "unhealthy"
        }
    }
    
    # Test database connection
    if db is not None:
        try:
            db.command("ping")
            health_status["services"]["database"] = "healthy"
        except Exception as e:
            health_status["services"]["database"] = "unhealthy"
            health_status["status"] = "degraded"
            health_status["database_error"] = str(e)
    
    return health_status

@app.post("/api/contact")
async def submit_contact_form(
    request: Request,
    name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    """Submit contact form with optional file attachments"""
    if contact_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Process uploaded files
        uploaded_files = []
        for file in files:
            if file.filename:  # Only process files that have a filename
                file_info = save_uploaded_file(file)
                uploaded_files.append(file_info)
        
        # Create submission document
        submission = {
            "name": name,
            "phone": phone,
            "email": email,
            "message": message,
            "uploaded_files": uploaded_files,
            "submitted_at": datetime.now(timezone.utc),
            "ip_address": get_client_ip(request),
            "user_agent": request.headers.get("User-Agent", ""),
            "status": "new"
        }
        
        # Insert into database
        result = contact_collection.insert_one(submission)
        
        return {
            "success": True,
            "message": "Contact form submitted successfully",
            "submission_id": str(result.inserted_id),
            "files_uploaded": len(uploaded_files)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting form: {str(e)}")

@app.get("/api/submissions")
async def get_submissions(limit: int = 50, skip: int = 0):
    """Get contact form submissions with pagination"""
    if contact_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Get submissions with pagination, sorted by submission date (newest first)
        submissions = list(
            contact_collection.find()
            .sort("submitted_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        # Convert ObjectId to string for JSON serialization
        for submission in submissions:
            submission["_id"] = str(submission["_id"])
        
        # Get total count
        total_count = contact_collection.count_documents({})
        
        return {
            "submissions": submissions,
            "total": total_count,
            "limit": limit,
            "skip": skip
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching submissions: {str(e)}")

@app.put("/api/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status_update: StatusUpdate):
    """Update submission status"""
    if contact_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        from bson import ObjectId
        
        # Update the submission status
        result = contact_collection.update_one(
            {"_id": ObjectId(submission_id)},
            {
                "$set": {
                    "status": status_update.status,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {"success": True, "message": "Status updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@app.get("/api/submissions/{submission_id}/file/{filename}")
async def download_file(submission_id: str, filename: str):
    """Download uploaded file"""
    file_path = os.path.join("uploads", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@app.get("/api/stats")
async def get_stats():
    """Get submission statistics"""
    if contact_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Get total submissions
        total_submissions = contact_collection.count_documents({})
        
        # Get submissions by status
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        status_breakdown = list(contact_collection.aggregate(status_pipeline))
        
        # Get submissions by date (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        date_pipeline = [
            {"$match": {"submitted_at": {"$gte": thirty_days_ago}}},
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$submitted_at"
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        daily_submissions = list(contact_collection.aggregate(date_pipeline))
        
        return {
            "stats": {
                "total_submissions": total_submissions,
                "status_breakdown": status_breakdown,
                "daily_submissions": daily_submissions
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.post("/api/send-reply")
async def send_reply(reply_data: EmailReply):
    """Send email reply to user"""
    try:
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reply from MECHGENZ</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); padding: 30px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MECHGENZ</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px; letter-spacing: 2px;">TRADING CONTRACTING AND SERVICES</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #ff5722; margin-bottom: 20px;">Dear {reply_data.to_name},</h2>
                    
                    <p style="margin-bottom: 20px;">Thank you for contacting MECHGENZ Trading Contracting & Services. We have received your inquiry and are pleased to respond.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #ff5722; margin: 20px 0;">
                        <h3 style="color: #ff5722; margin-top: 0;">Our Response:</h3>
                        <p style="margin-bottom: 0; white-space: pre-line;">{reply_data.reply_message}</p>
                    </div>
                    
                    <div style="background-color: #f1f3f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="color: #666; margin-top: 0; font-size: 14px;">Your Original Message:</h4>
                        <p style="margin-bottom: 0; font-style: italic; color: #666; white-space: pre-line;">{reply_data.original_message}</p>
                    </div>
                    
                    <p>If you have any additional questions or need further assistance, please don't hesitate to contact us.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br><strong>MECHGENZ Team</strong></p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #2c3e50; color: white; padding: 30px 20px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #ff5722; margin-bottom: 15px;">Contact Information</h3>
                        <p style="margin: 5px 0;"><strong>Address:</strong> Buzwair Complex, 4th Floor, Rawdat Al Khail St, Doha Qatar</p>
                        <p style="margin: 5px 0;"><strong>P.O. Box:</strong> 22911</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> +974 30401080</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> info@mechgenz.com</p>
                        <p style="margin: 5px 0;"><strong>Website:</strong> www.mechgenz.com</p>
                    </div>
                    
                    <div style="border-top: 1px solid #34495e; padding-top: 20px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 12px; color: #bdc3c7;">
                            © 2024 MECHGENZ W.L.L. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Dear {reply_data.to_name},

        Thank you for contacting MECHGENZ Trading Contracting & Services.

        Our Response:
        {reply_data.reply_message}

        Your Original Message:
        {reply_data.original_message}

        Best regards,
        MECHGENZ Team

        Contact Information:
        Address: Buzwair Complex, 4th Floor, Rawdat Al Khail St, Doha Qatar
        P.O. Box: 22911
        Phone: +974 30401080
        Email: info@mechgenz.com
        Website: www.mechgenz.com
        """
        
        # Send email using Resend
        email_response = resend.Emails.send({
            "from": "mechgenz4@gmail.com",
            "to": reply_data.to_email,
            "subject": "Reply from MECHGENZ - Your Inquiry",
            "html": html_content,
            "text": text_content
        })
        
        return {
            "success": True,
            "message": "Reply sent successfully",
            "email_id": email_response.get("id")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending reply: {str(e)}")

# Admin Authentication Endpoints
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint"""
    if admin_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Find admin user
        admin = admin_collection.find_one({
            "email": login_data.email,
            "password": login_data.password  # In production, use proper password hashing
        })
        
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Remove password from response
        admin.pop("password", None)
        admin["_id"] = str(admin["_id"])
        
        return {
            "success": True,
            "message": "Login successful",
            "admin": admin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

@app.get("/api/admin/profile")
async def get_admin_profile():
    """Get admin profile"""
    if admin_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        admin = admin_collection.find_one({"email": "mechgenz4@gmail.com"})
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Remove password from response
        admin.pop("password", None)
        admin["_id"] = str(admin["_id"])
        
        return {"admin": admin}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@app.put("/api/admin/profile")
async def update_admin_profile(update_data: AdminUpdate):
    """Update admin profile"""
    if admin_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Find current admin
        admin = admin_collection.find_one({"email": "mechgenz4@gmail.com"})
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # If password change is requested, verify current password
        update_fields = {
            "name": update_data.name,
            "email": update_data.email,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if update_data.password and update_data.currentPassword:
            if admin["password"] != update_data.currentPassword:
                raise HTTPException(status_code=400, detail="Current password is incorrect")
            update_fields["password"] = update_data.password
        
        # Update admin profile
        result = admin_collection.update_one(
            {"email": "mechgenz4@gmail.com"},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Return updated admin info
        updated_admin = admin_collection.find_one({"email": update_data.email})
        updated_admin.pop("password", None)
        updated_admin["_id"] = str(updated_admin["_id"])
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "admin": updated_admin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

# Website Images Management Endpoints
@app.get("/api/website-images")
async def get_website_images():
    """Get all website images"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        print("🔍 Fetching website images from database...")
        images = {}
        cursor = website_images_collection.find()
        
        for image_doc in cursor:
            image_id = image_doc.pop("_id")
            images[image_id] = image_doc
            print(f"📷 Found image: {image_id} - {image_doc.get('name', 'Unknown')}")
        
        print(f"✅ Retrieved {len(images)} images from database")
        
        return {"images": images}
        
    except Exception as e:
        print(f"❌ Error fetching images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching images: {str(e)}")

@app.get("/api/website-images/categories")
async def get_image_categories():
    """Get all image categories"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        categories = website_images_collection.distinct("category")
        print(f"📂 Found categories: {categories}")
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@app.post("/api/website-images/{image_id}/upload")
async def upload_website_image(image_id: str, file: UploadFile = File(...)):
    """Upload a new image for a website component"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Validate image exists in config
        if image_id not in WEBSITE_IMAGES_CONFIG:
            raise HTTPException(status_code=404, detail="Image configuration not found")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join("public/images", unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update database
        new_url = f"/images/{unique_filename}"
        result = website_images_collection.update_one(
            {"_id": image_id},
            {
                "$set": {
                    "current_url": new_url,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.matched_count == 0:
            # Create new document if it doesn't exist
            config = WEBSITE_IMAGES_CONFIG[image_id]
            image_doc = {
                "_id": image_id,
                "name": config["name"],
                "description": config["description"],
                "current_url": new_url,
                "default_url": config["default_url"],
                "locations": config["locations"],
                "recommended_size": config["recommended_size"],
                "category": config["category"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            website_images_collection.insert_one(image_doc)
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "new_url": new_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@app.put("/api/website-images/{image_id}")
async def update_website_image(image_id: str, update_data: ImageUpdate):
    """Update image metadata"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        result = website_images_collection.update_one(
            {"_id": image_id},
            {
                "$set": {
                    "name": update_data.name,
                    "description": update_data.description,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return {"success": True, "message": "Image updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating image: {str(e)}")

@app.delete("/api/website-images/{image_id}/reset")
async def reset_website_image(image_id: str):
    """Reset image to default"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        # Get default URL from config
        if image_id not in WEBSITE_IMAGES_CONFIG:
            raise HTTPException(status_code=404, detail="Image configuration not found")
        
        default_url = WEBSITE_IMAGES_CONFIG[image_id]["default_url"]
        
        result = website_images_collection.update_one(
            {"_id": image_id},
            {
                "$set": {
                    "current_url": default_url,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return {
            "success": True,
            "message": "Image reset to default",
            "default_url": default_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting image: {str(e)}")

# Force reinitialize images endpoint (for debugging)
@app.post("/api/website-images/reinitialize")
async def reinitialize_website_images():
    """Force reinitialize all website images (admin only)"""
    if website_images_collection is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        await initialize_website_images()
        return {"success": True, "message": "Website images reinitialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reinitializing images: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MECHGENZ API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)