# MECHGENZ Contact Form Backend

A FastAPI backend service for handling contact form submissions with MongoDB Atlas integration.

## Features

- **Dynamic Form Handling**: Accepts any JSON payload without strict schema validation
- **MongoDB Atlas Integration**: Stores submissions in MongoDB Atlas cloud database
- **CORS Support**: Configured for frontend integration
- **Admin Endpoints**: Retrieve and manage form submissions
- **Health Checks**: Monitor service and database connectivity
- **Error Handling**: Comprehensive error handling and logging
- **Statistics**: Get insights about form submissions

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file and add your MongoDB Atlas connection string:
```
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Run the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Public Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/contact` - Submit contact form

### Admin Endpoints

- `GET /api/submissions` - Get all submissions (with pagination)
- `PUT /api/submissions/{id}/status` - Update submission status
- `GET /api/stats` - Get submission statistics

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage Examples

### Submit Contact Form

```javascript
const response = await fetch('http://localhost:8000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+974 1234 5678',
    message: 'Hello, I need more information about your services.'
  })
});

const result = await response.json();
console.log(result);
```

### Get Submissions (Admin)

```javascript
const response = await fetch('http://localhost:8000/api/submissions?limit=10&skip=0');
const data = await response.json();
console.log(data.submissions);
```

## Database Structure

The service uses MongoDB with the following structure:

- **Database**: `MECHGENZ`
- **Collection**: `contact_submissions`

Each document contains:
- All form fields (dynamic)
- `submitted_at`: Timestamp
- `ip_address`: Client IP
- `user_agent`: Browser information
- `status`: Submission status (default: "new")

## Frontend Integration

Update your frontend form submission to use the backend:

```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('http://localhost:8000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Form submitted successfully:', result);
      // Handle success
    } else {
      console.error('Form submission failed');
      // Handle error
    }
  } catch (error) {
    console.error('Network error:', error);
    // Handle network error
  }
};
```

## Security Considerations

1. **CORS Configuration**: Update the allowed origins in `main.py` to match your frontend domains
2. **Environment Variables**: Never commit your `.env` file with real credentials
3. **Rate Limiting**: Consider adding rate limiting for production use
4. **Authentication**: Add authentication for admin endpoints in production
5. **Input Validation**: Add additional validation as needed for your use case

## Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Update CORS origins to include your production domain
3. Consider using a production WSGI server like Gunicorn
4. Set up proper logging and monitoring
5. Configure SSL/TLS certificates

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string format
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify username/password credentials

2. **CORS Errors**
   - Update the `allow_origins` list in the CORS middleware
   - Ensure your frontend URL is included

3. **Port Already in Use**
   - Change the port in `main.py` or kill the process using port 8000

### Logs

The application logs important events and errors. Check the console output for debugging information.