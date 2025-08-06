const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class Site {
    static async create({ name, address, client_id }) {
        const result = await safeQuery(
            'INSERT INTO sites (id, name, client_id) VALUES (UUID(), ?, ?)',
            [name,  client_id]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM sites WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM sites');
        return rows;
    }

    static async findByClientId(clientId) {
        const rows = await safeQuery('SELECT * FROM sites WHERE client_id = ?', [clientId]);
        return rows;
    }

    static async update(id, { name, address, client_id }) {
        await safeQuery(
            'UPDATE sites SET name = ?, address = ?, client_id = ? WHERE id = ?',
            [name, address, client_id, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM sites WHERE id = ?', [id]);
    }

    static async getClient(siteId) {
        const rows = await safeQuery(
            'SELECT c.* FROM clients c JOIN sites s ON c.id = s.client_id WHERE s.id = ?',
            [siteId]
        );
        return rows[0];
    }
}

module.exports = Site;