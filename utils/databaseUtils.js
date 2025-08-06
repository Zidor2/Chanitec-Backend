const { pool } = require('../database/pool');

/**
 * Safe database query execution with automatic connection management
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const safeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Safe transaction execution
 * @param {Function} callback - Function containing transaction logic
 * @returns {Promise<any>} Transaction result
 */
const withTransaction = async (callback) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const result = await callback(connection);

        await connection.commit();
        return result;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Transaction error:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Batch insert with connection pooling
 * @param {string} table - Table name
 * @param {Array} data - Array of objects to insert
 * @param {Array} fields - Field names
 * @returns {Promise<Array>} Insert results
 */
const batchInsert = async (table, data, fields) => {
    if (!data || data.length === 0) {
        return [];
    }

    const placeholders = data.map(() => `(${fields.map(() => '?').join(', ')})`).join(', ');
    const values = data.flatMap(row => fields.map(field => row[field]));

    const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${placeholders}`;

    return await safeQuery(query, values);
};

/**
 * Check if a record exists
 * @param {string} table - Table name
 * @param {string} field - Field to check
 * @param {any} value - Value to check
 * @returns {Promise<boolean>} Whether record exists
 */
const recordExists = async (table, field, value) => {
    const query = `SELECT COUNT(*) as count FROM ${table} WHERE ${field} = ?`;
    const result = await safeQuery(query, [value]);
    return result[0].count > 0;
};

/**
 * Get paginated results
 * @param {string} query - Base SQL query
 * @param {Array} params - Query parameters
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated results
 */
const getPaginatedResults = async (query, params = [], page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');

    const [results, countResult] = await Promise.all([
        safeQuery(`${query} LIMIT ? OFFSET ?`, [...params, limit, offset]),
        safeQuery(countQuery, params)
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

module.exports = {
    safeQuery,
    withTransaction,
    batchInsert,
    recordExists,
    getPaginatedResults
};