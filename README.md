# EduTasker

EduTasker is a task management platform with backend and client applications.

## Backend (edutasker-api)

### Setup
1. Install dependencies:
   ```fish
   bun install
   ```
2. Configure environment variables in `src/config/env.ts`.

### Development
- Start the server with hot reload:
  ```fish
  bun run dev
  ```
- The server runs at `http://localhost:3000` by default.

### API Documentation
- Swagger docs are available at:
  http://localhost:3000/docs
- Endpoints:
  - `POST /auth/register` — Register a new user
  - `POST /auth/login` — Login
  - `GET /users/me` — Get current user profile (requires JWT)

## Client (edutasker-client)
- Frontend code is located in `client/edutasker-client/`.

---
For more details, see the backend and client README files.
