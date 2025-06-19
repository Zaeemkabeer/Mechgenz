# MECHGENZ Backend API

FastAPI backend with MongoDB Atlas integration for the MECHGENZ website contact form.

## Features

- ✅ FastAPI with async/await support
- ✅ MongoDB Atlas integration with Motor (async MongoDB driver)
- ✅ Automatic schema creation
- ✅ Data validation with Pydantic
- ✅ CORS support for frontend integration
- ✅ Comprehensive error handling
- ✅ Logging and monitoring
- ✅ RESTful API endpoints
- ✅ API documentation with Swagger UI

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your MongoDB Atlas connection string:

```env
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=mechgenz_db
COLLECTION_NAME=contact_submissions
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string from the "Connect" button
5. Replace `<username>`, `<password>`, and `<cluster-url>` in your connection string

### 4. Run the Server

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Contact Form Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact/submit` | Submit a new contact form |
| GET | `/api/contact/submissions` | Get all submissions (with pagination) |
| GET | `/api/contact/submissions/{id}` | Get specific submission |
| PATCH | `/api/contact/submissions/{id}/status` | Update submission status |
| DELETE | `/api/contact/submissions/{id}` | Delete submission |
| GET | `/api/contact/stats` | Get submission statistics |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |

## Data Schema

The contact form automatically creates the following schema in MongoDB:

```json
{
  "_id": "ObjectId",
  "name": "string (2-100 chars)",
  "phone": "string (8-20 chars)",
  "email": "valid email address",
  "message": "string (10-1000 chars)",
  "created_at": "datetime",
  "status": "string (default: 'new')"
}
```

## Frontend Integration

Update your frontend contact form to submit to the backend:

```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('http://localhost:8000/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
    } else {
      alert('Error submitting form');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error occurred');
  }
};
```

## Database Collections

The system automatically creates:

- **Collection**: `contact_submissions`
- **Indexes**: 
  - `email` (for faster lookups)
  - `created_at` (for sorting)

## Error Handling

The API includes comprehensive error handling:

- **400**: Bad Request (validation errors)
- **404**: Not Found
- **500**: Internal Server Error
- **503**: Service Unavailable (database issues)

## Logging

All operations are logged with timestamps and details for monitoring and debugging.

## Security Features

- Input validation and sanitization
- Email format validation
- Phone number validation
- Message length limits
- CORS protection
- Error message sanitization

## Development

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and configuration
│   ├── config.py            # Settings and environment variables
│   ├── database.py          # MongoDB connection and setup
│   ├── models.py            # Pydantic models and validation
│   └── routes/
│       ├── __init__.py
│       └── contact.py       # Contact form endpoints
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
├── run.py                  # Server startup script
└── README.md               # This file
```

### Adding New Features

1. Create new Pydantic models in `models.py`
2. Add new routes in the `routes/` directory
3. Include new routers in `main.py`
4. Update requirements.txt if needed

## Production Deployment

For production deployment:

1. Set `RELOAD=false` in environment variables
2. Use a production WSGI server like Gunicorn
3. Set up proper logging and monitoring
4. Configure SSL/TLS certificates
5. Set up database backups
6. Configure firewall rules

## Support

For issues or questions, contact the development team or check the API documentation at `/docs`.