const { safeQuery } = require('../utils/databaseUtils');

const formatDateValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return value ?? null;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : value;
};

const formatTimeValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return value ?? null;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(11, 16);
    }
    const match = String(value).match(/(\d{2}:\d{2})/);
    return match ? match[1] : value;
};

const serializeIntervention = (row) => {
    if (!row) return row;
    return {
        ...row,
        intervention_date: formatDateValue(row.intervention_date),
        heure_arrive: formatTimeValue(row.heure_arrive),
        heure_depart: formatTimeValue(row.heure_depart)
    };
};

class Intervention {
    static async create({
        quote_id,
        client_id,
        intervention_date,
        heure_arrive,
        heure_depart,
        site_id,
        object,
        raison
    }) {
        const result = await safeQuery(
            `INSERT INTO interventions
             (quote_id, client_id, intervention_date, heure_arrive, heure_depart, site_id, object, raison)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quote_id || null,
                client_id || null,
                intervention_date,
                heure_arrive || null,
                heure_depart || null,
                site_id || null,
                object || null,
                raison || null
            ]
        );
        return this.findById(result.insertId);
    }

    static async findById(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM interventions WHERE intervention_id = ?',
            [intervention_id]
        );
        return serializeIntervention(rows[0]);
    }

    static async findAll(filters = {}) {
        const conditions = [];
        const params = [];

        // Basic filters
        if (filters.quote_id) {
            conditions.push('i.quote_id = ?');
            params.push(filters.quote_id);
        }
        if (filters.client_id) {
            conditions.push('i.client_id = ?');
            params.push(filters.client_id);
        }
        if (filters.site_id) {
            conditions.push('i.site_id = ?');
            params.push(filters.site_id);
        }

        // Date range
        if (filters.dateFrom) {
            conditions.push('i.intervention_date >= ?');
            params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
            conditions.push('i.intervention_date <= ?');
            params.push(filters.dateTo);
        }

        // Object / type filter
        if (filters.object) {
            conditions.push('i.object = ?');
            params.push(filters.object);
        }

        // If split_id filter provided, we need to join mesure_releve to filter by split
        let sql = '';
        if (filters.split_id) {
            sql = `SELECT DISTINCT i.* FROM interventions i
                   JOIN intervention_mesure_releve m ON i.intervention_id = m.intervention_id`;
            conditions.push('m.split_id = ?');
            params.push(filters.split_id);
        } else {
            sql = `SELECT i.* FROM interventions i`;
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        sql = `${sql} ${where} ORDER BY i.created_at DESC, i.intervention_id DESC`;

        const rows = await safeQuery(sql, params);
        return rows.map(serializeIntervention);
    }

    static async update(intervention_id, data) {
        const fields = [];
        const params = [];

        const allowed = {
            quote_id: 'quote_id',
            client_id: 'client_id',
            intervention_date: 'intervention_date',
            heure_arrive: 'heure_arrive',
            heure_depart: 'heure_depart',
            site_id: 'site_id',
            object: '`object`',
            raison: 'raison'
        };

        for (const [key, column] of Object.entries(allowed)) {
            if (data[key] !== undefined) {
                const value = data[key] === '' && key !== 'intervention_date'
                    ? null
                    : data[key];
                fields.push(`${column} = ?`);
                params.push(value);
            }
        }

        if (fields.length === 0) {
            return this.findById(intervention_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(intervention_id);

        await safeQuery(
            `UPDATE interventions SET ${fields.join(', ')} WHERE intervention_id = ?`,
            params
        );

        return this.findById(intervention_id);
    }

    static async delete(intervention_id) {
        const result = await safeQuery(
            'DELETE FROM interventions WHERE intervention_id = ?',
            [intervention_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Intervention;
