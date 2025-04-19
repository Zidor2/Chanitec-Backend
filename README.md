# Chanitec Backend

This is the backend API for the Chanitec application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `/api/clients` - Client management
- `/api/quotes` - Quote management
- `/api/sites` - Site management

## Environment Variables

- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `PORT` - Server port
- `FRONTEND_URL` - Frontend application URL

## Deployment

This application can be deployed to Railway or any other Node.js hosting platform.