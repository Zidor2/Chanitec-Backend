const { safeQuery } = require('../utils/databaseUtils');

class InterventionObservations {
    static async create({
        intervention_id,
        observations_client,
        observations_chanic,
        signature_client,
        signature_chanic,
        technician_employee_ids
    }) {
        const result = await safeQuery(
            `INSERT INTO intervention_observations (
                intervention_id,
                observations_client,
                observations_chanic,
                signature_client,
                signature_chanic,
                technician_employee_ids
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                intervention_id,
                observations_client ?? null,
                observations_chanic ?? null,
                signature_client ?? null,
                signature_chanic ?? null,
                technician_employee_ids ?? null
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(observation_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_observations WHERE observation_id = ?',
            [observation_id]
        );
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_observations WHERE intervention_id = ? ORDER BY observation_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(observation_id, data) {
        const fields = [];
        const params = [];
        const allowed = [
            'observations_client',
            'observations_chanic',
            'signature_client',
            'signature_chanic',
            'technician_employee_ids'
        ];

        for (const key of allowed) {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(data[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(observation_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(observation_id);

        await safeQuery(
            `UPDATE intervention_observations SET ${fields.join(', ')} WHERE observation_id = ?`,
            params
        );

        return this.findById(observation_id);
    }

    static async upsertByInterventionId(intervention_id, data) {
        const existing = await this.findByInterventionId(intervention_id);
        if (existing) {
            return this.update(existing.observation_id, data);
        }
        return this.create({
            intervention_id,
            observations_client: data.observations_client,
            observations_chanic: data.observations_chanic,
            signature_client: data.signature_client,
            signature_chanic: data.signature_chanic,
            technician_employee_ids: data.technician_employee_ids
        });
    }

    static async delete(observation_id) {
        const result = await safeQuery(
            'DELETE FROM intervention_observations WHERE observation_id = ?',
            [observation_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = InterventionObservations;
