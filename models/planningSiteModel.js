const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');

class PlanningSite {
    static async create({
        planning_id,
        site_id,
        planned_date,
        effective_date,
        status = 'planned',
        is_delayed = 0,
        description
    }) {
        const result = await safeQuery(
            `INSERT INTO planning_sites (id, planning_id, site_id, planned_date, effective_date, status, is_delayed, description)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
            [planning_id, site_id, planned_date, effective_date, status, is_delayed, description]
        );

        // Get the newly created planning_site record
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE planning_id = ? AND site_id = ? ORDER BY created_at DESC LIMIT 1',
            [planning_id, site_id]
        );

        return rows[0];
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM planning_sites WHERE id = ?', [id]);
        return rows[0];
    }

    static async findAll() {
        const rows = await safeQuery('SELECT * FROM planning_sites ORDER BY created_at DESC');
        return rows;
    }

    static async findByPlanningId(planningId) {
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE planning_id = ? ORDER BY created_at DESC',
            [planningId]
        );
        return rows;
    }

    static async findBySiteId(siteId) {
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE site_id = ? ORDER BY created_at DESC',
            [siteId]
        );
        return rows;
    }

    static async findByPlanningAndSite(planningId, siteId) {
        const rows = await safeQuery(
            'SELECT * FROM planning_sites WHERE planning_id = ? AND site_id = ?',
            [planningId, siteId]
        );
        return rows[0];
    }

    static async update(id, updates) {
        const allowedFields = [
            'planned_date',
            'effective_date',
            'status',
            'is_delayed',
            'description'
        ];

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
            `UPDATE planning_sites SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id) {
        const result = await safeQuery('DELETE FROM planning_sites WHERE id = ?', [id]);
        return result;
    }

    static async deleteByPlanningId(planningId) {
        const result = await safeQuery('DELETE FROM planning_sites WHERE planning_id = ?', [planningId]);
        return result;
    }

    static async deleteByPlanningAndSite(planningId, siteId) {
        const result = await safeQuery(
            'DELETE FROM planning_sites WHERE planning_id = ? AND site_id = ?',
            [planningId, siteId]
        );
        return result;
    }
}

module.exports = PlanningSite;
