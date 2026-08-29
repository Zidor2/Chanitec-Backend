const { safeQuery } = require('../utils/databaseUtils');

class InterventionLiaisonsElectriques {
    static async create({
        intervention_id,
        verification_fixation_circuits_frigorifiques,
        verification_calorifuge_circuits_frigorifiques,
        verification_fixation_circuits_electriques
    }) {
        const result = await safeQuery(
            `INSERT INTO intervention_liaisons_electriques_frigorifiques (
                intervention_id,
                verification_fixation_circuits_frigorifiques,
                verification_calorifuge_circuits_frigorifiques,
                verification_fixation_circuits_electriques
            ) VALUES (?, ?, ?, ?)` ,
            [
                intervention_id,
                verification_fixation_circuits_frigorifiques ?? null,
                verification_calorifuge_circuits_frigorifiques ?? null,
                verification_fixation_circuits_electriques ?? null
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(liaisons_id) {
        const rows = await safeQuery('SELECT * FROM intervention_liaisons_electriques_frigorifiques WHERE liaisons_id = ?', [liaisons_id]);
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_liaisons_electriques_frigorifiques WHERE intervention_id = ? ORDER BY liaisons_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(liaisons_id, data) {
        const fields = [];
        const params = [];

        const allowed = [
            'verification_fixation_circuits_frigorifiques',
            'verification_calorifuge_circuits_frigorifiques',
            'verification_fixation_circuits_electriques'
        ];

        for (const key of allowed) {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(data[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(liaisons_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(liaisons_id);

        await safeQuery(`UPDATE intervention_liaisons_electriques_frigorifiques SET ${fields.join(', ')} WHERE liaisons_id = ?`, params);

        return this.findById(liaisons_id);
    }

    static async delete(liaisons_id) {
        const result = await safeQuery('DELETE FROM intervention_liaisons_electriques_frigorifiques WHERE liaisons_id = ?', [liaisons_id]);
        return result.affectedRows > 0;
    }
}

module.exports = InterventionLiaisonsElectriques;
