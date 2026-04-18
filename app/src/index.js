const express = require('express');
const { requestLogger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/health', healthRoutes);
app.use('/api/users', usersRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'cicd-blueprints-api',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    docs: 'https://github.com/YOUR_USERNAME/cicd-blueprints#readme',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
