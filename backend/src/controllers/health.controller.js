const mongoose = require('mongoose');

function healthCheck(req, res) {
  const connectionStates = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: connectionStates[mongoose.connection.readyState] || 'unknown',
  });
}

module.exports = {
  healthCheck,
};