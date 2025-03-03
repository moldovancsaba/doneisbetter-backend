/**
 * Health check endpoint
 * Returns basic health information about the application
 */
module.exports = (req, res) => {
  const healthInfo = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    message: "API is operational"
  };

  res.status(200).json(healthInfo);
};

