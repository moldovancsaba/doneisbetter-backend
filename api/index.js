// Import the Express app from the compiled server file
const app = require('../dist/server');

// Export the Express app as a Vercel serverless function
module.exports = app;

