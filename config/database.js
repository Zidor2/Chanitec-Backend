require('dotenv').config();

const config = {
    development: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'chanic_db',
        port: process.env.DB_PORT || 3306,
        connectionLimit: 5,
        queueLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: '+00:00',
        ssl: false
    },
    production: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectionLimit: 3, // Reduced for AlwaysData limits
        queueLimit: 5,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: '+00:00',
        ssl: {
            rejectUnauthorized: false
        }
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];