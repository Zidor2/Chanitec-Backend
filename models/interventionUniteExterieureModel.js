const { safeQuery } = require('../utils/databaseUtils');

class InterventionUniteExterieure {
    static async create({
        intervention_id,
        absence_echauffement,
        absence_vibration,
        serrage_connexions_electriques,
        depoussierage_cablage_electrique,
        nettoyage_condenseur_eau_produit_detergent,
        verification_unite_exterieure,
        verification_fonctionnement_variateur_vitesse
    }) {
        const result = await safeQuery(
            `INSERT INTO intervention_unite_exterieure (
                intervention_id,
                absence_echauffement,
                absence_vibration,
                serrage_connexions_electriques,
                depoussierage_cablage_electrique,
                nettoyage_condenseur_eau_produit_detergent,
                verification_unite_exterieure,
                verification_fonctionnement_variateur_vitesse
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                intervention_id,
                absence_echauffement ?? null,
                absence_vibration ?? null,
                serrage_connexions_electriques ?? null,
                depoussierage_cablage_electrique ?? null,
                nettoyage_condenseur_eau_produit_detergent ?? null,
                verification_unite_exterieure ?? null,
                verification_fonctionnement_variateur_vitesse ?? null
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(unite_exterieure_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_unite_exterieure WHERE unite_exterieure_id = ?',
            [unite_exterieure_id]
        );
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_unite_exterieure WHERE intervention_id = ? ORDER BY unite_exterieure_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(unite_exterieure_id, data) {
        const fields = [];
        const params = [];

        const allowed = [
            'absence_echauffement',
            'absence_vibration',
            'serrage_connexions_electriques',
            'depoussierage_cablage_electrique',
            'nettoyage_condenseur_eau_produit_detergent',
            'verification_unite_exterieure',
            'verification_fonctionnement_variateur_vitesse'
        ];

        for (const key of allowed) {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(data[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(unite_exterieure_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(unite_exterieure_id);

        await safeQuery(
            `UPDATE intervention_unite_exterieure SET ${fields.join(', ')} WHERE unite_exterieure_id = ?`,
            params
        );

        return this.findById(unite_exterieure_id);
    }

    static async delete(unite_exterieure_id) {
        const result = await safeQuery(
            'DELETE FROM intervention_unite_exterieure WHERE unite_exterieure_id = ?',
            [unite_exterieure_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = InterventionUniteExterieure;
