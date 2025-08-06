const mysql = require('mysql2/promise');
const poolConfig = require('../config/database');

// Production-optimized pool configuration
const poolConfigWithDefaults = {
    ...poolConfig,
    waitForConnections: true
};

// Create the pool
const pool = mysql.createPool(poolConfigWithDefaults);

// Connection monitoring and health checks
let connectionCount = 0;
let activeConnections = 0;

// Monitor pool events
pool.on('connection', (connection) => {
    connectionCount++;
    activeConnections++;
    console.log(`🔗 New connection established. Total connections: ${connectionCount}, Active: ${activeConnections}`);

    // Set connection timeout
    connection.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                return this.escape(values[key]);
            }
            return txt;
        }.bind(this));
    };

    connection.on('error', (err) => {
        console.error('❌ Connection error:', err);
        activeConnections--;
    });

    connection.on('end', () => {
        activeConnections--;
        console.log(`🔌 Connection ended. Active connections: ${activeConnections}`);
    });
});

pool.on('acquire', (connection) => {
    console.log(`📥 Connection acquired. Active connections: ${activeConnections}`);
});

pool.on('release', (connection) => {
    console.log(`📤 Connection released. Active connections: ${activeConnections}`);
});

pool.on('enqueue', () => {
    console.log('⏳ Waiting for available connection slot...');
});

// Health check function
const healthCheck = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log(`✅ Database health check passed. Active connections: ${activeConnections}`);
        return true;
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('🔄 Shutting down database pool gracefully...');
    try {
        await pool.end();
        console.log('✅ Database pool closed successfully');
    } catch (error) {
        console.error('❌ Error closing database pool:', error);
    }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export pool and utilities
module.exports = {
    pool,
    healthCheck,
    gracefulShutdown,
    getConnectionStats: () => ({
        connectionCount,
        activeConnections,
        poolSize: poolConfigWithDefaults.connectionLimit
    })
};
