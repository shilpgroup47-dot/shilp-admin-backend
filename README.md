# Shilp Admin Server

A Node.js Express server for the Shilp Admin application with MongoDB Atlas integration.

## Features

- 🚀 Express.js REST API
- 🔒 JWT Authentication
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- 📊 MongoDB Atlas database
- 🔐 Password hashing with bcrypt
- 📝 Request logging with Morgan
- ⚡ Compression middleware
- 🎯 Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `CORS_ORIGIN` - Allowed CORS origin

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Endpoints

### Health Check
- `GET /api/health` - Server health check
- `GET /api/health/db` - Database health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling
│   └── notFound.js         # 404 handler
├── models/
│   └── User.js             # User model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── health.js           # Health check route
│   └── users.js            # User routes
├── services/               # Business logic
├── utils/                  # Utility functions
└── server.js               # Main server file
```

## Getting Started

1. Start the development server:
```bash
npm run dev
```

2. The server will be running at `http://localhost:3001`

3. Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

## Database

The application uses MongoDB Atlas. Make sure to:

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update the `DATABASE_URL` in your `.env` file

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Password hashing with bcrypt
- JWT token authentication
- Input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request# Testing Backend Deployment
# Server deployment test - Fri Nov 14 17:15:21 IST 2025
