const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createUsersTable() {
    // Read database configuration
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'Chanitec',
        multipleStatements: true
    };

    try {
        console.log('Attempting to connect to MySQL database...');
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to MySQL database');

        // Create users table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(60) NOT NULL DEFAULT 'viewer',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_users_username (username)
            );
        `;

        console.log('Creating users table...');
        await connection.query(createTableQuery);
        console.log('✅ Users table created successfully!');

        // Insert a default admin user
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);

        const insertAdminQuery = `
            INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?);
        `;

        console.log('Creating default admin user...');
        await connection.query(insertAdminQuery, ['admin', adminPassword, 'admin']);
        console.log('✅ Default admin user created (username: admin, password: admin123)');

        await connection.end();
        console.log('✅ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

// Run the setup
createUsersTable();