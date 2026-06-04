const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class Planning {
    static async create({ client_id, name, description, status = 'planned' }) {
        const result = await safeQuery(
            'INSERT INTO planning (id, client_id, name, description, status) VALUES (UUID(), ?, ?, ?, ?)',
            [client_id, name, description, status]
        );

        // Get the newly created planning record
        const rows = await safeQuery(
            'SELECT * FROM planning WHERE name = ? AND client_id = ? ORDER BY created_at DESC LIMIT 1',
            [name, client_id]
        );

        return rows[0];
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM planning WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM planning ORDER BY created_at DESC');
        return rows;
    }

    static async findByClientId(clientId) {
        const rows = await safeQuery(
            'SELECT * FROM planning WHERE client_id = ? ORDER BY created_at DESC',
            [clientId]
        );
        return rows;
    }

    static async update(id, { name, description, status }) {
        await safeQuery(
            'UPDATE planning SET name = ?, description = ?, status = ? WHERE id = ?',
            [name, description, status, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM planning WHERE id = ?', [id]);
    }

    static async findByStatus(status) {
        const rows = await safeQuery(
            'SELECT * FROM planning WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        return rows;
    }

    static async findByClientIdAndStatus(clientId, status) {
        const rows = await safeQuery(
            'SELECT * FROM planning WHERE client_id = ? AND status = ? ORDER BY created_at DESC',
            [clientId, status]
        );
        return rows;
    }
}

module.exports = Planning;
