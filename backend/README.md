# MECHGENZ Contact API Backend

A FastAPI backend service for handling contact form submissions with MongoDB Atlas integration.

## Features

- **Dynamic Form Handling**: Accept any form data structure without strict schemas
- **MongoDB Integration**: Store submissions in MongoDB Atlas
- **Email Validation**: Built-in email validation using Pydantic
- **CORS Support**: Configured for cross-origin requests
- **Admin Endpoints**: Retrieve and manage submissions
- **Health Checks**: Monitor API and database connectivity
- **Error Handling**: Comprehensive error handling and logging

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file and update with your MongoDB connection string:

```bash
cp .env.example .env
```

Edit `.env` and replace `your-mongodb-connection-string-here` with your actual MongoDB Atlas connection string.

### 3. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check including database status

### Contact Form Submission
- `POST /api/contact` - Submit structured contact form
- `POST /api/contact/dynamic` - Submit any form data dynamically

### Admin Endpoints
- `GET /api/submissions` - Retrieve contact submissions (with pagination)
- `PUT /api/submissions/{id}/status` - Update submission status

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Example Usage

### Structured Contact Form

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
    message: 'I would like to inquire about your services.',
    company: 'ABC Company',
    subject: 'Service Inquiry'
  })
});

const result = await response.json();
console.log(result);
```

### Dynamic Form Submission

```javascript
const response = await fetch('http://localhost:8000/api/contact/dynamic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    service_type: 'MEP Systems',
    project_budget: '100000-500000',
    timeline: 'Q2 2024',
    custom_field: 'Any custom data',
    form_type: 'service_inquiry'
  })
});
```

## Database Structure

The API stores all submissions in the `MECHGENZ` database under the `contact_submissions` collection. Each document includes:

- Original form data (as submitted)
- `created_at`: Timestamp of submission
- `status`: Current status (new, contacted, resolved, etc.)
- `source`: Source of the submission (website_contact_form, dynamic_form, etc.)
- `_id`: MongoDB ObjectId

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB Atlas connection string | Required |
| `API_HOST` | API host address | 0.0.0.0 |
| `API_PORT` | API port number | 8000 |
| `DEBUG` | Enable debug mode | True |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost |

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in environment variables
2. Configure specific allowed origins in CORS settings
3. Use a production WSGI server like Gunicorn
4. Set up proper logging and monitoring
5. Secure your MongoDB connection string

Example production command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Security Considerations

- The API currently allows all origins (`*`) in CORS. Update this for production.
- Implement rate limiting for production use
- Add authentication for admin endpoints
- Validate and sanitize all input data
- Use HTTPS in production
- Secure your MongoDB connection string

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error
- Custom error messages for better debugging

## Logging

The application uses Python's built-in logging module. Logs include:
- Successful submissions
- Database connection status
- Error details for debugging

## Support

For issues or questions, please check the API documentation at `/docs` or contact the development team.