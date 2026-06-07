const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class PlanningSplit {
    static async create({
        planning_site_id,
        split_id = null,
        status = 'pending'
    }) {
        const result = await safeQuery(
            `INSERT INTO planning_split (id, planning_site_id, split_id, status)
             VALUES (UUID(), ?, ?, ?)`,
            [planning_site_id, split_id, status]
        );

        // Get the newly created planning_split record
        const rows = await safeQuery(
            'SELECT * FROM planning_split WHERE planning_site_id = ? AND split_id = ? ORDER BY created_at DESC LIMIT 1',
            [planning_site_id, split_id]
        );

        return rows[0];
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM planning_split WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM planning_split ORDER BY created_at DESC');
        return rows;
    }

    static async findByPlanningSiteId(planningSiteId) {
        const rows = await safeQuery(
            'SELECT * FROM planning_split WHERE planning_site_id = ? ORDER BY created_at DESC',
            [planningSiteId]
        );
        return rows;
    }

    static async findByStatus(status) {
        const rows = await safeQuery(
            'SELECT * FROM planning_split WHERE status = ? ORDER BY created_at DESC',
            [status]
        );
        return rows;
    }

    static async update(id, updates) {
        const allowedFields = ['status'];

        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        await safeQuery(
            `UPDATE planning_split SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id) {
        const result = await safeQuery('DELETE FROM planning_split WHERE id = ?', [id]);
        return result;
    }

    static async deleteByPlanningSiteId(planningSiteId) {
        const result = await safeQuery('DELETE FROM planning_split WHERE planning_site_id = ?', [planningSiteId]);
        return result;
    }

    static async count() {
        const rows = await safeQuery('SELECT COUNT(*) as count FROM planning_split');
        return rows[0].count;
    }

    static async countByStatus(status) {
        const rows = await safeQuery('SELECT COUNT(*) as count FROM planning_split WHERE status = ?', [status]);
        return rows[0].count;
    }
}

module.exports = PlanningSplit;
