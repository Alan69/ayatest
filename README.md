# AyaTest

A test management application for creating and taking tests.

## Features

- User authentication with JWT
- Admin dashboard for managing tests, questions, and users
- Test creation and management
- Test taking and scoring
- Real-time updates with NATS and Temporal

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Alan69/ayatest.git
   cd ayatest
   ```

2. Copy the example environment file and modify as needed:
   ```bash
   cp .env.example .env
   ```

3. Start the development environment:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8082
   - GraphQL Playground: http://localhost:8082/playground
   - Temporal UI: http://localhost:8081

## Production Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/Alan69/ayatest.git
   cd ayatest
   ```

2. Copy the example environment file and modify for production:
   ```bash
   cp .env.example .env
   ```

3. Update the JWT_SECRET in the .env file:
   ```
   JWT_SECRET=your_secure_random_string
   ```

4. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. Access the application:
   - Frontend and API: https://yourdomain.com

## Default Users

The seed service creates the following default users:

- Admin User:
  - Username: admin
  - Password: admin
  - Role: ADMIN

- Test User:
  - Username: test
  - Password: password
  - Role: USER

## API Endpoints

### Authentication

- `POST /api/login`: Login with username and password
- `POST /api/register`: Register a new user

### Admin API

- `GET /api/admin/users`: Get all users (admin only)
- `GET /api/admin/products`: Get all products (admin only)
- `GET /api/admin/tests`: Get all tests (admin only)

### GraphQL API

- `/query`: GraphQL endpoint for all operations
- `/playground`: GraphQL playground for testing queries

## Technologies Used

- Backend:
  - Go
  - GORM (PostgreSQL)
  - GraphQL
  - JWT Authentication
  - NATS for messaging
  - Temporal for workflows

- Frontend:
  - React
  - Tailwind CSS
  - JWT Authentication

## License

MIT 