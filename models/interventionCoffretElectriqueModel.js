const { safeQuery } = require('../utils/databaseUtils');

class InterventionCoffretElectrique {
    static async create({
        intervention_id,
        nettoyage_depoussierage_coffret_electrique,
        serrage_connexions_electriques,
        etat_fusibles_coffret_puissance,
        etat_voyants_fonctionnement_sirene,
        verification_fonctionnement_minuterie
    }) {
        const result = await safeQuery(
            `INSERT INTO intervention_coffret_electrique_commande_puissance (
                intervention_id,
                nettoyage_depoussierage_coffret_electrique,
                serrage_connexions_electriques,
                etat_fusibles_coffret_puissance,
                etat_voyants_fonctionnement_sirene,
                verification_fonctionnement_minuterie
            ) VALUES (?, ?, ?, ?, ?, ?)` ,
            [
                intervention_id,
                nettoyage_depoussierage_coffret_electrique ?? null,
                serrage_connexions_electriques ?? null,
                etat_fusibles_coffret_puissance ?? null,
                etat_voyants_fonctionnement_sirene ?? null,
                verification_fonctionnement_minuterie ?? null
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(coffret_electrique_id) {
        const rows = await safeQuery('SELECT * FROM intervention_coffret_electrique_commande_puissance WHERE coffret_electrique_id = ?', [coffret_electrique_id]);
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_coffret_electrique_commande_puissance WHERE intervention_id = ? ORDER BY coffret_electrique_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(coffret_electrique_id, data) {
        const fields = [];
        const params = [];

        const allowed = [
            'nettoyage_depoussierage_coffret_electrique',
            'serrage_connexions_electriques',
            'etat_fusibles_coffret_puissance',
            'etat_voyants_fonctionnement_sirene',
            'verification_fonctionnement_minuterie'
        ];

        for (const key of allowed) {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(data[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(coffret_electrique_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(coffret_electrique_id);

        await safeQuery(`UPDATE intervention_coffret_electrique_commande_puissance SET ${fields.join(', ')} WHERE coffret_electrique_id = ?`, params);

        return this.findById(coffret_electrique_id);
    }

    static async delete(coffret_electrique_id) {
        const result = await safeQuery('DELETE FROM intervention_coffret_electrique_commande_puissance WHERE coffret_electrique_id = ?', [coffret_electrique_id]);
        return result.affectedRows > 0;
    }
}

module.exports = InterventionCoffretElectrique;
