from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from datetime import datetime
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager
from bson import ObjectId
from pathlib import Path
import os
from dotenv import load_dotenv
import logging
import resend
import json
import uuid
import hashlib

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

DATABASE_NAME = "MECHGENZ"
COLLECTION_NAME = "contact_submissions"
GALLERY_COLLECTION_NAME = "website_images"
ADMIN_COLLECTION_NAME = "admin_users"

# Resend configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "re_G4hUh9oq_Dcaj4qoYtfWWv5saNvgG7ZEW")
COMPANY_EMAIL = os.getenv("REPLY_FROM_EMAIL", "mechgenz4@gmail.com")
VERIFIED_DOMAIN = os.getenv("VERIFIED_DOMAIN", None)  # Set this to your verified domain

# Initialize Resend
resend.api_key = RESEND_API_KEY

# File upload configuration
UPLOAD_DIR = Path("images")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Global MongoDB client
mongodb_client = None
database = None
collection = None
gallery_collection = None
admin_collection = None
is_db_connected = False

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == hashed

def initialize_gallery_data():
    """Initialize gallery collection with default website images"""
    global gallery_collection
    
    try:
        if gallery_collection is None:
            return False
            
        # Check if gallery data already exists
        existing_count = gallery_collection.count_documents({})
        if existing_count > 0:
            logger.info(f"Gallery collection already has {existing_count} images")
            return True
            
        logger.info("Initializing gallery collection with default images...")
        
        # Default gallery images configuration (10 images with 9 categories)
        default_images = [
            {
                "id": "hero_main_banner",
                "name": "Main Hero Banner",
                "description": "Primary hero banner displayed on the homepage",
                "current_url": "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg",
                "default_url": "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg",
                "locations": ["Homepage Hero", "Main Banner"],
                "recommended_size": "1920x1080",
                "category": "hero",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "about_company_image",
                "name": "About Company Image",
                "description": "Image representing our company and values",
                "current_url": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
                "default_url": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
                "locations": ["About Page", "Company Section"],
                "recommended_size": "800x600",
                "category": "about",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "services_trading",
                "name": "Trading Services",
                "description": "Image showcasing our trading and contracting services",
                "current_url": "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg",
                "default_url": "https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg",
                "locations": ["Services Page", "Trading Section"],
                "recommended_size": "600x400",
                "category": "services",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "services_contracting",
                "name": "Contracting Services",
                "description": "Image representing our contracting and construction services",
                "current_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg",
                "default_url": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg",
                "locations": ["Services Page", "Contracting Section"],
                "recommended_size": "600x400",
                "category": "services",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "portfolio_project_1",
                "name": "Featured Project 1",
                "description": "Showcase of our premium project work",
                "current_url": "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
                "default_url": "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
                "locations": ["Portfolio Page", "Featured Projects"],
                "recommended_size": "800x600",
                "category": "portfolio",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "portfolio_project_2",
                "name": "Featured Project 2",
                "description": "Another example of our quality work",
                "current_url": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg",
                "default_url": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg",
                "locations": ["Portfolio Page", "Featured Projects"],
                "recommended_size": "800x600",
                "category": "portfolio",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "contact_office_image",
                "name": "Office Location",
                "description": "Image of our office location in Doha",
                "current_url": "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg",
                "default_url": "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg",
                "locations": ["Contact Page", "Office Section"],
                "recommended_size": "600x400",
                "category": "contact",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "team_leadership",
                "name": "Leadership Team",
                "description": "Photo representing our leadership and management team",
                "current_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
                "default_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
                "locations": ["About Page", "Team Section"],
                "recommended_size": "800x600",
                "category": "team",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "logo_main",
                "name": "MECHGENZ Logo",
                "description": "Main company logo for branding",
                "current_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
                "default_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
                "locations": ["Header", "Footer", "All Pages"],
                "recommended_size": "300x100",
                "category": "branding",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "testimonials_background",
                "name": "Testimonials Background",
                "description": "Background image for customer testimonials section",
                "current_url": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
                "default_url": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
                "locations": ["Homepage", "Testimonials Section"],
                "recommended_size": "1200x800",
                "category": "testimonials",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "trading_machinery",
                "name": "Trading Machinery",
                "description": "Heavy machinery and equipment trading showcase",
                "current_url": "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
                "default_url": "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
                "locations": ["Trading Page", "Machinery Section"],
                "recommended_size": "800x600",
                "category": "trading",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert all default images
        result = gallery_collection.insert_many(default_images)
        logger.info(f"✅ Successfully initialized gallery with {len(result.inserted_ids)} images")
        
        # Create indexes for better performance
        gallery_collection.create_index("id", unique=True)
        gallery_collection.create_index("category")
        gallery_collection.create_index("updated_at")
        
        logger.info("✅ Gallery database indexes created")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error initializing gallery data: {e}")
        return False

def initialize_default_admin():
    """Initialize default admin if none exists"""
    global admin_collection
    
    try:
        if admin_collection is None:
            return False
            
        # Check if any admin exists
        existing_admin = admin_collection.find_one({})
        if existing_admin:
            logger.info("Admin user already exists")
            # Update existing admin with correct credentials if needed
            if existing_admin.get("email") != "mechgenz4@gmail.com" or not verify_password("mechgenz4", existing_admin.get("password", "")):
                logger.info("Updating admin credentials to match requirements...")
                admin_collection.update_one(
                    {"_id": existing_admin["_id"]},
                    {
                        "$set": {
                            "name": "Mechgenz",
                            "email": "mechgenz4@gmail.com",
                            "password": hash_password("mechgenz4"),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                logger.info("✅ Admin credentials updated")
            return True
            
        logger.info("Creating default admin user...")
        
        # Create default admin with the requested credentials
        default_admin = {
            "name": "Mechgenz",
            "email": "mechgenz4@gmail.com",
            "password": hash_password("mechgenz4"),  # Updated default password
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = admin_collection.insert_one(default_admin)
        logger.info(f"✅ Default admin created with ID: {result.inserted_id}")
        logger.info("Default login: mechgenz4@gmail.com / mechgenz4")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating default admin: {e}")
        return False

def connect_to_mongodb():
    """Initialize MongoDB connection"""
    global mongodb_client, database, collection, gallery_collection, admin_collection, is_db_connected
    
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
        
        # Get database and collections
        database = mongodb_client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]
        gallery_collection = database[GALLERY_COLLECTION_NAME]
        admin_collection = database[ADMIN_COLLECTION_NAME]
        is_db_connected = True
        
        logger.info(f"Database: {DATABASE_NAME}, Collections: {COLLECTION_NAME}, {GALLERY_COLLECTION_NAME}, {ADMIN_COLLECTION_NAME}")
        
        # Initialize gallery data if empty
        initialize_gallery_data()
        
        # Initialize default admin if none exists
        initialize_default_admin()
        
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
    else:
        logger.info("✅ Gallery management system ready")
        logger.info("✅ Admin system ready")
    
    yield
    
    # Shutdown
    close_mongodb_connection()

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="MECHGENZ Contact Form API",
    description="Backend API for handling contact form submissions and gallery management",
    version="1.0.0",
    lifespan=lifespan
)

# Mount static files for image serving
app.mount("/images", StaticFiles(directory="images"), name="images")

# Get CORS origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

# CORS middleware configuration - Updated for admin panel compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "Content-Range", "Access-Control-Expose-Headers"]
)

# Add a middleware to include proper headers for admin panels
@app.middleware("http")
async def add_cors_and_pagination_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, Content-Range"
    
    return response

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

# ============================================================================
# ADMIN PROFILE ENDPOINTS
# ============================================================================

@app.get("/api/admin/profile")
async def get_admin_profile():
    """Get admin profile information"""
    try:
        if not is_db_connected or admin_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get the first (and should be only) admin user
        admin = admin_collection.find_one({})
        if not admin:
            raise HTTPException(
                status_code=404,
                detail="Admin profile not found"
            )
        
        # Remove sensitive data
        admin_data = {
            "name": admin.get("name", ""),
            "email": admin.get("email", ""),
            "created_at": admin.get("created_at", "").isoformat() if admin.get("created_at") else "",
            "updated_at": admin.get("updated_at", "").isoformat() if admin.get("updated_at") else ""
        }
        
        return {
            "success": True,
            "admin": admin_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching admin profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch admin profile"
        )

@app.put("/api/admin/profile")
async def update_admin_profile(request: Request):
    """Update admin profile information"""
    try:
        if not is_db_connected or admin_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get request data
        data = await request.json()
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        current_password = data.get("currentPassword", "")
        new_password = data.get("password", "")
        
        # Validate required fields
        if not name:
            raise HTTPException(
                status_code=400,
                detail="Name is required"
            )
        
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email is required"
            )
        
        # Get current admin
        admin = admin_collection.find_one({})
        if not admin:
            raise HTTPException(
                status_code=404,
                detail="Admin profile not found"
            )
        
        # Prepare update data
        update_data = {
            "name": name,
            "email": email,
            "updated_at": datetime.utcnow()
        }
        
        # If password change is requested, verify current password and update
        if new_password:
            if not current_password:
                raise HTTPException(
                    status_code=400,
                    detail="Current password is required to change password"
                )
            
            # Verify current password
            if not verify_password(current_password, admin.get("password", "")):
                raise HTTPException(
                    status_code=400,
                    detail="Current password is incorrect"
                )
            
            # Add new password to update data
            update_data["password"] = hash_password(new_password)
        
        # Update admin profile
        result = admin_collection.update_one(
            {"_id": admin["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to update admin profile"
            )
        
        # Return updated admin data (without password)
        updated_admin = {
            "name": update_data["name"],
            "email": update_data["email"],
            "updated_at": update_data["updated_at"].isoformat()
        }
        
        logger.info(f"Admin profile updated successfully")
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "admin": updated_admin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating admin profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update admin profile"
        )

@app.post("/api/admin/login")
async def admin_login(request: Request):
    """Admin login endpoint"""
    try:
        if not is_db_connected or admin_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        data = await request.json()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        
        if not email or not password:
            raise HTTPException(
                status_code=400,
                detail="Email and password are required"
            )
        
        # Find admin by email
        admin = admin_collection.find_one({"email": email})
        if not admin:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(password, admin.get("password", "")):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Return success (in a real app, you'd return a JWT token)
        return {
            "success": True,
            "message": "Login successful",
            "admin": {
                "name": admin.get("name", ""),
                "email": admin.get("email", "")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during admin login: {e}")
        raise HTTPException(
            status_code=500,
            detail="Login failed"
        )

# ============================================================================
# DEBUG ENDPOINTS FOR ADMIN
# ============================================================================

@app.get("/api/debug/admin")
async def debug_admin():
    """Debug admin data and password hashing"""
    try:
        if not is_db_connected or admin_collection is None:
            return {"error": "Database not connected"}
        
        # Get admin data
        admin = admin_collection.find_one({})
        if not admin:
            return {"error": "No admin found"}
        
        # Remove _id for cleaner output
        admin_data = dict(admin)
        admin_data.pop("_id", None)
        
        # Test password hashing
        test_passwords = ["admin123", "mechgenz4"]
        password_tests = {}
        
        stored_password = admin.get("password", "")
        
        for test_pwd in test_passwords:
            hashed = hash_password(test_pwd)
            matches = verify_password(test_pwd, stored_password)
            password_tests[test_pwd] = {
                "hashed": hashed,
                "matches_stored": matches
            }
        
        return {
            "admin_data": admin_data,
            "stored_password": stored_password,
            "password_tests": password_tests,
            "admin_collection_count": admin_collection.count_documents({})
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/debug/reset-admin-password")
async def reset_admin_password():
    """Reset admin password to 'mechgenz4'"""
    try:
        if not is_db_connected or admin_collection is None:
            return {"error": "Database not connected"}
        
        # Get admin
        admin = admin_collection.find_one({})
        if not admin:
            return {"error": "No admin found"}
        
        # Reset password to mechgenz4
        new_password = "mechgenz4"
        hashed_password = hash_password(new_password)
        
        # Update password
        result = admin_collection.update_one(
            {"_id": admin["_id"]},
            {
                "$set": {
                    "email": "mechgenz4@gmail.com",
                    "name": "Mechgenz",
                    "password": hashed_password,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            return {
                "success": True,
                "message": "Admin credentials set to mechgenz4@gmail.com / mechgenz4",
                "email": "mechgenz4@gmail.com",
                "new_password": new_password,
                "hashed_password": hashed_password
            }
        else:
            return {"error": "Failed to update password"}
        
    except Exception as e:
        return {"error": str(e)}

# ============================================================================
# DEBUG ENDPOINTS FOR GALLERY
# ============================================================================

@app.get("/api/debug/gallery")
async def debug_gallery():
    """Debug endpoint to check gallery data"""
    try:
        if not is_db_connected or gallery_collection is None:
            return {"error": "Database not connected", "gallery_collection": gallery_collection is None}
        
        # Get all images from database
        cursor = gallery_collection.find({})
        images = []
        
        for doc in cursor:
            doc.pop("_id", None)  # Remove MongoDB _id
            if "created_at" in doc and hasattr(doc["created_at"], 'isoformat'):
                doc["created_at"] = doc["created_at"].isoformat()
            if "updated_at" in doc and hasattr(doc["updated_at"], 'isoformat'):
                doc["updated_at"] = doc["updated_at"].isoformat()
            images.append(doc)
        
        return {
            "images_count": len(images),
            "images": images,
            "database_connected": is_db_connected,
            "collection_name": GALLERY_COLLECTION_NAME
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/debug/reinitialize-gallery")
async def reinitialize_gallery():
    """Force reinitialize gallery data"""
    try:
        if gallery_collection is None:
            return {"error": "Gallery collection not available"}
        
        # Drop existing data
        gallery_collection.delete_many({})
        logger.info("Cleared existing gallery data")
        
        # Reinitialize
        success = initialize_gallery_data()
        
        return {
            "success": success,
            "message": "Gallery reinitialized" if success else "Failed to reinitialize"
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/debug/fix-gallery-ids")
async def fix_gallery_ids():
    """Fix missing id fields in gallery documents"""
    try:
        if gallery_collection is None:
            return {"error": "Gallery collection not available"}
        
        # Get all documents
        cursor = gallery_collection.find({})
        fixed_count = 0
        
        for doc in cursor:
            # Check if document is missing 'id' field
            if 'id' not in doc:
                # Generate an ID from the name or use a default pattern
                name = doc.get('name', 'unknown')
                # Create a simple ID from the name
                new_id = name.lower().replace(' ', '_').replace('-', '_')
                
                # Make sure the ID is unique by checking if it already exists
                existing = gallery_collection.find_one({"id": new_id})
                counter = 1
                original_id = new_id
                while existing and str(existing.get("_id")) != str(doc["_id"]):
                    new_id = f"{original_id}_{counter}"
                    existing = gallery_collection.find_one({"id": new_id})
                    counter += 1
                
                # Update the document to add the id field
                gallery_collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"id": new_id}}
                )
                fixed_count += 1
                logger.info(f"Fixed document: added id '{new_id}' for '{name}'")
        
        return {
            "success": True,
            "message": f"Fixed {fixed_count} documents by adding missing 'id' fields",
            "fixed_count": fixed_count
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/debug/collections")
async def debug_collections():
    """Check what collections exist and their document counts"""
    try:
        if not is_db_connected or database is None:
            return {"error": "Database not connected"}
        
        # List all collections
        collections = database.list_collection_names()
        
        collection_info = {}
        for coll_name in collections:
            coll = database[coll_name]
            count = coll.count_documents({})
            
            # Get a sample document if any exist
            sample = None
            if count > 0:
                sample_doc = coll.find_one()
                if sample_doc:
                    sample_doc.pop("_id", None)
                    sample = sample_doc
            
            collection_info[coll_name] = {
                "count": count,
                "sample": sample
            }
        
        return {
            "collections": collection_info,
            "gallery_collection_name": GALLERY_COLLECTION_NAME,
            "admin_collection_name": ADMIN_COLLECTION_NAME,
            "is_db_connected": is_db_connected
        }
        
    except Exception as e:
        return {"error": str(e)}

# ============================================================================
# GALLERY MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/api/website-images")
async def get_website_images():
    """Get all website images in format expected by admin panels"""
    try:
        if not is_db_connected or gallery_collection is None:
            logger.warning("Database not connected, returning empty gallery")
            return {
                "success": True,
                "images": {},
                "total_count": 0
            }
        
        logger.info("Fetching images from gallery collection...")
        
        # Fetch all images from database
        cursor = gallery_collection.find({})
        images = {}
        doc_count = 0
        processed_count = 0
        
        for doc in cursor:
            doc_count += 1
            logger.info(f"Processing document {doc_count}: {doc.get('id', 'NO_ID')}")
            
            # Check if the document has 'id' field
            image_id = doc.get("id")
            if not image_id:
                logger.warning(f"Document missing 'id' field, skipping: {list(doc.keys())}")
                continue
            
            try:
                # Convert MongoDB document to the expected format
                images[image_id] = {
                    "id": image_id,
                    "name": doc.get("name", "Unknown"),
                    "description": doc.get("description", "No description"),
                    "current_url": doc.get("current_url", ""),
                    "default_url": doc.get("default_url", ""),
                    "locations": doc.get("locations", []),
                    "recommended_size": doc.get("recommended_size", ""),
                    "category": doc.get("category", "other"),
                    "updated_at": datetime.utcnow().isoformat()  # Simplified for now
                }
                processed_count += 1
                logger.info(f"Successfully processed image: {image_id}")
                
            except Exception as doc_error:
                logger.error(f"Error processing document {image_id}: {doc_error}")
                continue
        
        logger.info(f"Processed {processed_count} out of {doc_count} documents")
        logger.info(f"Final images dict has {len(images)} items")
        
        return {
            "success": True,
            "images": images,
            "total_count": len(images)
        }
        
    except Exception as e:
        logger.error(f"Error fetching website images: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "images": {},
            "total_count": 0,
            "error": str(e)
        }

@app.get("/api/website-images/categories")
async def get_image_categories():
    """Get all unique image categories"""
    try:
        if not is_db_connected or gallery_collection is None:
            return {
                "success": True,
                "categories": ["hero", "about", "services", "portfolio", "contact", "team", "branding", "testimonials", "trading"]
            }
        
        # Get unique categories from database
        categories = gallery_collection.distinct("category")
        categories.sort()
        
        logger.info(f"Retrieved {len(categories)} image categories")
        
        return {
            "success": True,
            "categories": categories
        }
        
    except Exception as e:
        logger.error(f"Error fetching image categories: {e}")
        return {
            "success": True,
            "categories": ["hero", "about", "services", "portfolio", "contact", "team", "branding", "testimonials", "trading"]
        }

@app.post("/api/website-images/{image_id}/upload")
async def upload_image(image_id: str, file: UploadFile = File(...)):
    """Upload a new image for a specific image slot"""
    try:
        if not is_db_connected or gallery_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Check if image exists
        existing_image = gallery_collection.find_one({"id": image_id})
        if not existing_image:
            raise HTTPException(
                status_code=404,
                detail=f"Image with ID '{image_id}' not found"
            )
        
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file provided"
            )
        
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content to check size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Generate unique filename
        unique_filename = f"{image_id}_{uuid.uuid4().hex[:8]}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Update database with new URL
        new_url = f"/images/{unique_filename}"
        update_result = gallery_collection.update_one(
            {"id": image_id},
            {
                "$set": {
                    "current_url": new_url,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count == 0:
            # Clean up uploaded file if database update failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail="Failed to update image in database"
            )
        
        logger.info(f"Successfully uploaded image for {image_id}: {unique_filename}")
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "image_id": image_id,
            "new_url": new_url,
            "filename": unique_filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload image"
        )

@app.put("/api/website-images/{image_id}")
async def update_image_metadata(image_id: str, request: Request):
    """Update image metadata (name and description)"""
    try:
        if not is_db_connected or gallery_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get request data
        data = await request.json()
        name = data.get("name", "").strip()
        description = data.get("description", "").strip()
        
        if not name:
            raise HTTPException(
                status_code=400,
                detail="Name is required"
            )
        
        # Update image metadata
        update_result = gallery_collection.update_one(
            {"id": image_id},
            {
                "$set": {
                    "name": name,
                    "description": description,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if update_result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Image with ID '{image_id}' not found"
            )
        
        logger.info(f"Updated metadata for image {image_id}")
        
        return {
            "success": True,
            "message": "Image metadata updated successfully",
            "image_id": image_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating image metadata: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update image metadata"
        )

@app.delete("/api/website-images/{image_id}/reset")
async def reset_image_to_default(image_id: str):
    """Reset image to its default URL"""
    try:
        if not is_db_connected or gallery_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Get current image data
        image_doc = gallery_collection.find_one({"id": image_id})
        if not image_doc:
            raise HTTPException(
                status_code=404,
                detail=f"Image with ID '{image_id}' not found"
            )
        
        # Delete current uploaded file if it exists
        current_url = image_doc.get("current_url", "")
        if current_url.startswith("/images/"):
            file_path = UPLOAD_DIR / current_url.replace("/images/", "")
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted uploaded file: {file_path}")
        
        # Reset to default URL
        default_url = image_doc["default_url"]
        update_result = gallery_collection.update_one(
            {"id": image_id},
            {
                "$set": {
                    "current_url": default_url,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to reset image"
            )
        
        logger.info(f"Reset image {image_id} to default")
        
        return {
            "success": True,
            "message": "Image reset to default successfully",
            "image_id": image_id,
            "default_url": default_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting image: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to reset image"
        )

@app.delete("/api/website-images/{image_id}")
async def delete_image(image_id: str, delete_type: str = "image_only"):
    """Delete image (either just the uploaded file or the entire configuration)"""
    try:
        if not is_db_connected or gallery_collection is None:
            raise HTTPException(
                status_code=503,
                detail="Database connection not available"
            )
        
        # Validate delete_type
        if delete_type not in ["image_only", "complete"]:
            raise HTTPException(
                status_code=400,
                detail="delete_type must be either 'image_only' or 'complete'"
            )
        
        # Get current image data
        image_doc = gallery_collection.find_one({"id": image_id})
        if not image_doc:
            raise HTTPException(
                status_code=404,
                detail=f"Image with ID '{image_id}' not found"
            )
        
        # Delete uploaded file if it exists
        current_url = image_doc.get("current_url", "")
        if current_url.startswith("/images/"):
            file_path = UPLOAD_DIR / current_url.replace("/images/", "")
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted uploaded file: {file_path}")
        
        if delete_type == "image_only":
            # Reset to default URL
            default_url = image_doc["default_url"]
            update_result = gallery_collection.update_one(
                {"id": image_id},
                {
                    "$set": {
                        "current_url": default_url,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if update_result.modified_count == 0:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to reset image"
                )
            
            logger.info(f"Deleted custom image for {image_id}, reset to default")
            
            return {
                "success": True,
                "message": "Custom image deleted, reset to default",
                "image_id": image_id,
                "default_url": default_url
            }
        
        else:  # complete deletion
            # Remove entire image configuration
            delete_result = gallery_collection.delete_one({"id": image_id})
            
            if delete_result.deleted_count == 0:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete image configuration"
                )
            
            logger.info(f"Completely deleted image configuration for {image_id}")
            
            return {
                "success": True,
                "message": "Image configuration deleted completely",
                "image_id": image_id
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete image"
        )

# ============================================================================
# EXISTING CONTACT FORM ENDPOINTS (PRESERVED)
# ============================================================================

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