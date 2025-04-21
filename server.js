require('dotenv').config();
console.log("🔥 DB HOST:", process.env.DB_HOST);

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./database/pool');

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

// Routes
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/sites', require('./routes/siteRoutes'));
app.use('/api/supply-items', require('./routes/supplyItemRoutes'));
app.use('/api/labor-items', require('./routes/laborItemRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/debug', require('./routes/debugRoutes'));

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
            quotes: '/api/quotes',
            supplyItems: '/api/supply-items',
            laborItems: '/api/labor-items',
            items: '/api/items',
            debug: '/api/debug'
        }
    });
});

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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API available at= ${process.env.DB_HOST}:${port}`);
});