const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the database');
    connection.release();
});

// Add connection pool health monitoring
const monitorPoolHealth = () => {
    setInterval(() => {
        try {
            // Get pool status safely
            const poolStatus = pool.pool;
            const total = poolStatus ? poolStatus.length || 0 : 0;
            const used = poolStatus ? (poolStatus.numUsed ? poolStatus.numUsed() : 0) : 0;
            const idle = total - used;

            console.log(`📊 Pool Status - Total: ${total}, Idle: ${idle}, Used: ${used}`);
        } catch (error) {
            console.log('📊 Pool Status - Unable to get pool information');
        }
    }, 30000); // Log every 30 seconds
};

// Start monitoring
monitorPoolHealth();

module.exports = pool;
