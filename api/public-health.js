// Public health endpoint - accessible without authentication
module.exports = (req, res) => {
  // Set CORS headers to allow access from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // For preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return health status information
  const healthStatus = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime())
    }
  };
  
  // Send response with 200 OK status
  return res.status(200).json(healthStatus);
};
