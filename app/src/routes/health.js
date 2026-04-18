const express = require('express');
const router = express.Router();

// GET /health
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// GET /health/ready — readiness probe (useful for k8s/Docker)
router.get('/ready', (req, res) => {
  res.status(200).json({ ready: true });
});

module.exports = router;
