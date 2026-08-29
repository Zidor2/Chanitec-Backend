const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
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
        console.log('Attempting to connect to MySQL...');
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to MySQL server');

        const migrationDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        if (migrationFiles.length === 0) {
            console.log('No migration files found.');
        }

        for (const migrationFile of migrationFiles) {
            const migrationPath = path.join(migrationDir, migrationFile);
            const migration = fs.readFileSync(migrationPath, 'utf8');
            console.log(`Running migration: ${migrationFile}`);
            await connection.query(migration);
        }

        console.log('All migrations completed successfully!');

        await connection.end();
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

// Run the migration
runMigration();