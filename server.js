require('dotenv').config();
console.log("🔥 DB HOST:", process.env.DB_HOST);

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { pool, healthCheck } = require('./database/pool');
const quoteRoutes = require('./routes/quoteRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const splitRoutes = require('./routes/splitRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;
console.log('🔥 Server PORT:', port);

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000'  // Add localhost for development
]
// Middleware

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/quotes', quoteRoutes);
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/supply-items', require('./routes/supplyItemRoutes'));
app.use('/api/labor-items', require('./routes/laborItemRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/debug', require('./routes/debugRoutes'));
app.use('/api/descriptions', require('./routes/descriptionRoutes'));
app.use('/api/employees', employeeRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Chanitec API' });
});

app.use((req, res, next) => {
    console.log('Received request:', req.originalUrl);
    next();
  });

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Chanitec API',
        endpoints: {
            clients: '/api/clients',
            sites: '/api/sites',
            quotes: '/api/quotes',
            supplyItems: '/api/supply-items',
            laborItems: '/api/labor-items',
            items: '/api/items',
            descriptions: '/api/descriptions',
            debug: '/api/debug',
            employees: '/api/employees',
            auth: '/api/auth'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const isHealthy = await healthCheck();
        const stats = require('./database/pool').getConnectionStats();

        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            database: isHealthy ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            connectionStats: stats
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection before starting
        const isHealthy = await healthCheck();
        if (!isHealthy) {
            console.error('⚠️ Database connection failed at startup. Server will continue and retry on requests.');
        }

        app.listen(port, "0.0.0.0", () => {
            console.log(`✅ Server running on port ${port}`);
            console.log(`🌐 API available at http://localhost:${port}`);
            console.log(`🔍 Health check: http://localhost:${port}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
