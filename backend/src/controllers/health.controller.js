const mongoose = require('mongoose');

function healthCheck(req, res) {
  const isConnected = mongoose.connection.readyState === 1;
  const connectionStates = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  const dbState = connectionStates[mongoose.connection.readyState] || 'unknown';

  const responseBody = {
    success: isConnected,
    status: isConnected ? 'healthy' : 'unhealthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbState,
  };

  res.status(isConnected ? 200 : 503).json(responseBody);
}

module.exports = {
  healthCheck,
};