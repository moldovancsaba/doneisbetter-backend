# DoneIsBetter Backend

Express.js backend with MongoDB integration for the card management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
# Create .env file
echo "MONGODB_URI=your_mongodb_uri" > .env
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Cards
- GET /api/cards - Fetch all cards
- POST /api/cards - Create new card
- PUT /api/cards/:id - Update card
- DELETE /api/cards/:id - Delete card

## Database Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Set up database access
4. Add connection string to .env

## Error Handling

The API implements standard error responses:
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Deployment

1. Choose hosting platform
2. Set environment variables
3. Deploy application
4. Update CORS settings if needed

## Last Release
- Date: February 25, 2025 09:10:38 CET
