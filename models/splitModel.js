const { pool } = require('../database/pool');

class Split {
    static async create({ code, name, description, puissance, site_id }) {
        const [result] = await pool.query(
            'INSERT INTO split (Code, name, description, puissance, site_id) VALUES (?, ?, ?, ?, ?)',
            [code, name, description, puissance, site_id]
        );
        return this.findById(code);
    }

    static async findById(code) {
        const [rows] = await pool.query('SELECT * FROM split WHERE Code = ?', [code]);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM split');
        return rows;
    }

    static async findBySiteId(site_id) {
        const [rows] = await pool.query('SELECT * FROM split WHERE site_id = ?', [site_id]);
        return rows;
    }

    static async update(code, { name, description, puissance, site_id }) {
        await pool.query(
            'UPDATE split SET name = ?, description = ?, puissance = ?, site_id = ? WHERE Code = ?',
            [name, description, puissance, site_id, code]
        );
        return this.findById(code);
    }

    static async delete(code) {
        await pool.query('DELETE FROM split WHERE Code = ?', [code]);
    }

    static async getSite(spliteCode) {
        const [rows] = await pool.query(
            'SELECT c.* FROM sites c JOIN split s ON c.id = s.site_id WHERE s.Code = ?',
            [spliteCode]
        );
        return rows[0];
    }
}

module.exports = Split;