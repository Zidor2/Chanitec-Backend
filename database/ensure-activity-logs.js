const { pool } = require('./pool');

async function run() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                username VARCHAR(255) NULL,
                action VARCHAR(150) NOT NULL,
                entity_type VARCHAR(80) NULL,
                entity_id VARCHAR(64) NULL,
                method VARCHAR(10) NOT NULL,
                path VARCHAR(255) NOT NULL,
                status_code INT NOT NULL,
                details TEXT NULL,
                ip_address VARCHAR(45) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_activity_created (created_at),
                INDEX idx_activity_user (user_id),
                INDEX idx_activity_action (action)
            )
        `);
        const [rows] = await connection.query('SHOW TABLES LIKE "activity_logs"');
        console.log(rows);
    } finally {
        connection.release();
        await pool.end();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
