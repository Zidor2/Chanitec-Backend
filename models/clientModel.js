const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class Client {
    static async create({ name, email, phone, address }) {
        const result = await safeQuery(
            'INSERT INTO clients (id, name, email, phone, address) VALUES (UUID(), ?, ?, ?, ?)',
            [name, email, phone, address]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM clients WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM clients');
        return rows;
    }

    static async update(id, { name, email, phone, address }) {
        await safeQuery(
            'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [name, email, phone, address, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        await safeQuery('DELETE FROM clients WHERE id = ?', [id]);
    }

    static async getSites(clientId) {
        const rows = await safeQuery('SELECT * FROM sites WHERE client_id = ?', [clientId]);
        return rows;
    }
}

module.exports = Client;