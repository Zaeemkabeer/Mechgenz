# MECHGENZ Contact Form Backend

A FastAPI backend service for handling contact form submissions with MongoDB Atlas integration and email reply functionality.

## Features

- **Dynamic Form Handling**: Accepts any JSON payload without strict schema validation
- **MongoDB Atlas Integration**: Stores submissions in MongoDB Atlas cloud database
- **Email Reply System**: Send replies directly to user's email address
- **Admin Panel Support**: Full API support for admin panel functionality
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

2. Edit `.env` file and add your configurations:
```
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
EMAIL_PASSWORD=your-gmail-app-password
```

**Important**: For Gmail, you need to:
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for this application
3. Use the app password (not your regular Gmail password) in the EMAIL_PASSWORD field

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
- `POST /api/send-reply` - Send email reply to user

## Admin Panel Access

The admin panel is accessible at: `http://localhost:5173/admin`

**Login Credentials:**
- Email: `mechgenz4@gmail.com`
- Password: `mechgenz4`

## Email Reply System

The admin can reply to user inquiries directly from the admin panel. The system will:

1. Send a professional email reply to the user's original email address
2. Include the original message for context
3. Update the inquiry status to "replied"
4. Use the official MECHGENZ email template

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

### Send Reply Email (Admin)

```javascript
const response = await fetch('http://localhost:8000/api/send-reply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to_email: 'user@example.com',
    to_name: 'John Doe',
    reply_message: 'Thank you for your inquiry. We will contact you soon.',
    original_message: 'Original user message here'
  })
});
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
- `status`: Submission status ("new", "replied", etc.)
- `updated_at`: Last update timestamp (when status changes)

## Security Considerations

1. **CORS Configuration**: Update the allowed origins in `main.py` to match your frontend domains
2. **Environment Variables**: Never commit your `.env` file with real credentials
3. **Email Security**: Use Gmail App Passwords, not regular passwords
4. **Rate Limiting**: Consider adding rate limiting for production use
5. **Authentication**: The admin panel uses simple authentication - enhance for production
6. **Input Validation**: Add additional validation as needed for your use case

## Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Update CORS origins to include your production domain
3. Consider using a production WSGI server like Gunicorn
4. Set up proper logging and monitoring
5. Configure SSL/TLS certificates
6. Use a more robust authentication system for the admin panel

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string format
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify username/password credentials

2. **Email Sending Failed**
   - Ensure you're using a Gmail App Password, not your regular password
   - Check that 2-factor authentication is enabled on your Gmail account
   - Verify the EMAIL_PASSWORD in your .env file

3. **CORS Errors**
   - Update the `allow_origins` list in the CORS middleware
   - Ensure your frontend URL is included

4. **Port Already in Use**
   - Change the port in `main.py` or kill the process using port 8000

### Logs

The application logs important events and errors. Check the console output for debugging information.

## Admin Panel Features

- **Dashboard**: Overview of inquiries and statistics
- **User Inquiries**: View, filter, and reply to customer inquiries
- **Email System**: Send professional replies directly to users
- **Status Management**: Track inquiry status (new, replied, etc.)
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Login**: Protected admin access with credentials