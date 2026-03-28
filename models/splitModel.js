const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class Split {
    static async create({ code, name, description, puissance, site_id }) {
        const result = await safeQuery(
            'INSERT INTO split (Code, name, description, puissance, site_id) VALUES (?, ?, ?, ?, ?)',
            [code, name, description, puissance, site_id]
        );
        return this.findById(code);
    }

    static async findById(code) {
        const rows = await safeQuery('SELECT * FROM split WHERE Code = ?', [code]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM split');
        return rows;
    }

    static async findBySiteId(site_id) {
        const rows = await safeQuery('SELECT * FROM split WHERE site_id = ?', [site_id]);
        return rows;
    }

    static async update(code, { name, description, puissance, site_id }) {
        await safeQuery(
            'UPDATE split SET name = ?, description = ?, puissance = ?, site_id = ? WHERE Code = ?',
            [name, description, puissance, site_id, code]
        );
        return this.findById(code);
    }

    static async delete(code) {
        await safeQuery('DELETE FROM split WHERE Code = ?', [code]);
    }

    static async getSite(spliteCode) {
        const rows = await safeQuery(
            'SELECT c.* FROM sites c JOIN split s ON c.id = s.site_id WHERE s.Code = ?',
            [spliteCode]
        );
        return rows[0];
    }

    /**
     * Returns client + site for a split code (global uniqueness check).
     */
    static async findLocationByCode(code) {
        const rows = await safeQuery(
            `SELECT s.Code, s.site_id,
                    site.name AS site_name,
                    c.id AS client_id,
                    c.name AS client_name
             FROM split s
             INNER JOIN sites site ON site.id = s.site_id
             INNER JOIN clients c ON c.id = site.client_id
             WHERE s.Code = ?`,
            [code]
        );
        return rows[0] || null;
    }
}

module.exports = Split;