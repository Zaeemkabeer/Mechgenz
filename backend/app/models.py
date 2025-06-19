from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re

class ContactSubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the person")
    phone: str = Field(..., min_length=8, max_length=20, description="Phone number")
    email: EmailStr = Field(..., description="Valid email address")
    message: str = Field(..., min_length=10, max_length=1000, description="Message content")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status: Optional[str] = Field(default="new", description="Status of the submission")
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        # Remove extra whitespace and ensure proper capitalization
        return ' '.join(word.capitalize() for word in v.strip().split())
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove all non-digit characters for validation
        digits_only = re.sub(r'\D', '', v)
        
        # Check if it's a valid phone number (8-15 digits)
        if len(digits_only) < 8 or len(digits_only) > 15:
            raise ValueError('Phone number must be between 8 and 15 digits')
        
        # Return the original format (with formatting characters)
        return v.strip()
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or just whitespace')
        return v.strip()

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        schema_extra = {
            "example": {
                "name": "John Doe",
                "phone": "+974 1234 5678",
                "email": "john.doe@example.com",
                "message": "I am interested in your construction services. Please contact me for more information about your MEP solutions."
            }
        }

class ContactResponse(BaseModel):
    success: bool
    message: str
    submission_id: Optional[str] = None
    
class ContactListResponse(BaseModel):
    success: bool
    total: int
    submissions: list
    page: int
    limit: int