# EduTasker API

A comprehensive project management system designed for educational environments with integrated mentorship capabilities. Built with TypeScript, Express.js, and Prisma ORM using Bun runtime.

## 🚀 Overview

EduTasker API is a robust backend system that enables educational institutions to manage student projects with mentor guidance. It features role-based access control, Kanban-style task management, file storage integration, and real-time collaboration tools.

### Key Features

- **Authentication & Authorization**: JWT-based auth with role-based permissions
- **User Management**: Support for Students, Mentors, and Administrators
- **Project Management**: Multi-board Kanban system with task prioritization
- **File Management**: AWS S3 integration with secure file uploads
- **Mentorship System**: Dedicated mentor-student project collaboration
- **Real-time Communication**: Comments, notifications, and activity tracking
- **Data Import**: Excel/CSV file processing for bulk operations
- **API Documentation**: Swagger/OpenAPI integration

## 🛠 Technology Stack

- **Runtime**: Bun v1.2.13
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.2.13 or higher
- PostgreSQL database
- Redis server
- AWS S3 bucket (for file storage)
- Node.js v18+ (for production deployment)

## ⚙️ Environment Setup

Create a `.env` file in the project root:

```bash
# Server Configuration
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/edutasker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=3600000
JWT_REFRESH_EXPIRES_IN=86400000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3 Configuration
S3_BUCKET_NAME=your-edutasker-bucket
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev

# Seed database with initial data (optional)
bun run prisma:seed
```

### 3. Start Development Server

```bash
# Development with hot reload
bun run dev

# Production build
bun run build

# Start production server
bun run start
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI JSON**: `http://localhost:3000/docs.json`

## 🏗 Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.ts       # Environment validation
│   └── swagger.ts   # API documentation setup
├── helper/          # Utility functions
├── middleware/      # Express middleware
├── module/          # Feature modules
│   ├── auth/        # Authentication & authorization
│   ├── user/        # User management
│   ├── project/     # Project management
│   ├── task/        # Task management
│   ├── board/       # Kanban boards
│   ├── comment/     # Comments system
│   ├── file/        # File management
│   ├── mentor/      # Mentorship features
│   ├── role/        # Role-based access control
│   ├── import/      # Data import functionality
│   └── notification/# Notification system
├── app.ts           # Express app configuration
└── index.ts         # Application entry point
```

## 🔐 Authentication System

The API uses JWT-based authentication with refresh tokens:

### User Types
- **Students**: Can create projects, join as members
- **Mentors**: Can guide projects, provide feedback
- **Administrators**: Full system access

### Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

## 📊 Database Schema

### Core Entities

- **Users**: Base user entity with role assignments
- **Students**: Student-specific profile information
- **Mentors**: Mentor profiles with expertise areas
- **Projects**: Main organizational units
- **Boards**: Kanban boards within projects
- **Tasks**: Individual work items with priorities
- **Comments**: Task and project discussions
- **Files**: S3-stored project attachments

### Key Relationships

- Projects have multiple boards (Kanban style)
- Tasks belong to boards and can be assigned to users
- Users can be project members or mentors
- Granular permissions per project and resource

## 🎯 API Endpoints Overview

### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

### Users
```
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

### Projects
```
GET    /projects
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
POST   /projects/:id/members
DELETE /projects/:id/members/:userId
```

### Tasks
```
GET    /tasks
POST   /tasks
GET    /tasks/:id
PUT    /tasks/:id
DELETE /tasks/:id
POST   /tasks/:id/assign
DELETE /tasks/:id/assign/:userId
```

### Files
```
GET    /file/presigned-url
POST   /file/upload
GET    /file/:id
DELETE /file/:id
```

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
bun run dev

# Build TypeScript to JavaScript
bun run build

# Start production server
bun run start

# Database operations
bunx prisma migrate dev    # Run migrations
bunx prisma studio        # Database GUI
bunx prisma generate      # Generate client
bun run prisma:seed       # Seed database

# Code formatting
bun run format            # Format code
bun run format:check      # Check formatting
```

### Code Style

This project uses Prettier for code formatting. Configuration is in `.prettierrc.json`.

## 🐳 Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t edutasker-api .

# Run container
docker run -p 3000:3000 --env-file .env edutasker-api
```

### Docker Compose (recommended)

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/edutasker
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=edutasker
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

## 🧪 Testing

```bash
# Run tests (when implemented)
bun test

# Run tests with coverage
bun test --coverage
```

## 📈 Performance Considerations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Redis Caching**: Session and frequently accessed data caching
- **File Storage**: Direct S3 uploads with presigned URLs
- **Pagination**: Implemented on all list endpoints
- **Database Connection Pooling**: Prisma connection pooling

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with Joi
- CORS configuration
- Rate limiting (recommended to implement)
- Helmet.js security headers (recommended to implement)

## 🚦 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and formatting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.