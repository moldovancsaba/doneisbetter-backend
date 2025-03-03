// Standalone health check endpoint that bypasses authentication
module.exports = (req, res) => {
  // Set CORS headers to allow access from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return a simple health status
  return res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    message: 'Service is healthy'
  });
};

