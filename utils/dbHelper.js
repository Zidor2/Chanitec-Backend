const pool = require('../database/pool');

/**
 * Execute a database query with timeout protection
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, params = [], timeout = 30000) => {
    return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Query timeout after ${timeout}ms`));
        }, timeout);

        try {
            const [rows] = await pool.query(query, params);
            clearTimeout(timeoutId);
            resolve(rows);
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
};

/**
 * Execute a transaction with automatic rollback on error
 * @param {Function} callback - Function containing transaction logic
 * @returns {Promise<any>} Transaction result
 */
const executeTransaction = async (callback) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Error during rollback:', rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get connection pool status
 * @returns {Object} Pool status information
 */
const getPoolStatus = () => {
    try {
        const poolStatus = pool.pool;
        const total = poolStatus ? poolStatus.length || 0 : 0;
        const used = poolStatus ? (poolStatus.numUsed ? poolStatus.numUsed() : 0) : 0;
        const idle = total - used;
        const pending = poolStatus ? (poolStatus.numPendingAcquires ? poolStatus.numPendingAcquires() : 0) : 0;

        return {
            total: total,
            idle: idle,
            used: used,
            pending: pending
        };
    } catch (error) {
        return {
            total: 0,
            idle: 0,
            used: 0,
            pending: 0,
            error: 'Unable to get pool status'
        };
    }
};

module.exports = {
    executeQuery,
    executeTransaction,
    getPoolStatus
};
