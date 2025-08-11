const { Sequelize } = require('sequelize');
require('dotenv').config();
console.log('DB_NAME:', process.env.DB_NAME);
const sequelize = new Sequelize(
    process.env.DB_NAME ,
    process.env.DB_USER ,
    process.env.DB_PASSWORD ,
    {
        host: process.env.DB_HOST ,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
            evict: 60000,
            handleDisconnects: true
        }
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
    });

module.exports = sequelize;