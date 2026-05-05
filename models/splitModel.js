const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class splits {
    static async create({ code, name, description, puissance, site_id, freon }) {
        const result = await safeQuery(
            'INSERT INTO splits (Code, name, description, puissance, site_id, freon) VALUES (?, ?, ?, ?, ?, ?)',
            [code, name, description, puissance, site_id, freon || null]
        );
        // Return the newly created split with its auto-generated id
        const lastId = result.insertId;
        return this.findById(lastId);
    }

    // Find by id (new primary key)
    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM splits WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM splits');
        return rows;
    }

    static async findBySiteId(site_id) {
        const rows = await safeQuery('SELECT * FROM splits WHERE site_id = ?', [site_id]);
        return rows;
    }

    // Update by id (new primary key)
    static async update(id, { code, name, description, puissance, site_id, freon }) {
        // If code is being updated, check if new code already exists (excluding current record)
        if (code) {
            const existing = await safeQuery('SELECT id FROM splits WHERE Code = ? AND id != ?', [code, id]);
            if (existing.length > 0) {
                throw new Error('Split code already exists');
            }
        }

        await safeQuery(
            'UPDATE splits SET Code = ?, name = ?, description = ?, puissance = ?, site_id = ?, freon = ? WHERE id = ?',
            [code, name, description, puissance, site_id, freon || null, id]
        );
        return this.findById(id);
    }

    // Delete by id (new primary key)
    static async delete(id) {
        await safeQuery('DELETE FROM splits WHERE id = ?', [id]);
    }

    // Check if split needs updating by comparing all attributes
    static async needsUpdate(id, { code, name, description, puissance, site_id, freon }) {
        const current = await this.findById(id);
        if (!current) return false;

        // Compare all attributes (handle null/undefined values)
        const puissanceEqual = (current.puissance == puissance) || (current.puissance === null && puissance === null);
        const siteIdEqual = current.site_id === site_id;
        const freonEqual = (current.freon === freon) || (current.freon === null && freon === null) || (current.freon === null && !freon);

        return !(
            current.Code === code &&
            current.name === name &&
            current.description === description &&
            puissanceEqual &&
            siteIdEqual &&
            freonEqual
        );
    }

    static async getSite(spliteCode) {
        const rows = await safeQuery(
            'SELECT c.* FROM sites c JOIN splits s ON c.id = s.site_id WHERE s.Code = ?',
            [spliteCode]
        );
        return rows[0];
    }

    /**
     * Returns client + site for a splits code (global uniqueness check).
     */
    static async findLocationByCode(code) {
        const rows = await safeQuery(
            `SELECT s.Code, s.site_id,
                    site.name AS site_name,
                    c.id AS client_id,
                    c.name AS client_name
             FROM splits s
             INNER JOIN sites site ON site.id = s.site_id
             INNER JOIN clients c ON c.id = site.client_id
             WHERE s.Code = ?`,
            [code]
        );
        return rows[0] || null;
    }
}

module.exports = splits;