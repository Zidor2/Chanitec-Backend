require('dotenv').config();
console.log("🔥 DB HOST:", process.env.DB_HOST);

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./database/pool');
const sequelize = require('./database/database');
const quoteRoutes = require('./routes/quoteRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
const port = process.env.PORT ;

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
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

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
            debug: '/api/debug',
            departments: '/api/departments',
            employees: '/api/employees'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
  });

// 404 handler
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

// Sync database and start server
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database synced successfully');
        // Start server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`API available at= ${process.env.DB_HOST}:${port}`);
        });

        app.listen(port, "0.0.0.0", () => {
            console.log(`✅ Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('❌ Unable to sync database:', err);
    });
