require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: '0210',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'chanitec'
};

console.log('Starting server with configuration:', {
    port: port,
    dbHost: dbConfig.host,
    dbUser: dbConfig.user,
    dbPort: dbConfig.port,
    dbName: dbConfig.database
});

// Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Chanitec API' });
});

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Chanitec API',
        endpoints: {
            clients: '/api/clients',
            sites: '/api/sites',
            quotes: '/api/quotes'
        }
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping();
        await connection.end();
        res.json({ status: 'ok', message: 'Database connection successful' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Import routes
try {
    const supplyItemRoutes = require('./routes/supplyItemRoutes');
    const laborItemRoutes = require('./routes/laborItemRoutes');
    const itemRoutes = require('./routes/itemRoutes');
    const debugRoutes = require('./routes/debugRoutes');

    app.use('/api/supply-items', supplyItemRoutes);
    app.use('/api/labor-items', laborItemRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/debug', debugRoutes);
} catch (error) {
    console.error('Error loading routes:', error.stack);
    throw error;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API available at http://localhost:${port}/api`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
});

// Handle server shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});