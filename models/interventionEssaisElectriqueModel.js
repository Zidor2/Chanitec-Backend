const { safeQuery } = require('../utils/databaseUtils');

class InterventionEssaisElectrique {
    static async create({ intervention_id, essai_securite_bp, essai_securite_hp, essai_marche_forcee_ht, essai_basculement_defaut, essai_marche_forcee_cas_ht, essai_basculement_cas_defaut }) {
        const forcedOperationValue = essai_marche_forcee_cas_ht ?? essai_marche_forcee_ht ?? null;
        const faultSwitchoverValue = essai_basculement_cas_defaut ?? essai_basculement_defaut ?? null;

        const result = await safeQuery(
            `INSERT INTO intervention_essais_electrique_frigorifique (
                intervention_id,
                essai_securite_bp,
                essai_securite_hp,
                essai_marche_forcee_cas_ht,
                essai_basculement_cas_defaut
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                intervention_id,
                essai_securite_bp ?? null,
                essai_securite_hp ?? null,
                forcedOperationValue,
                faultSwitchoverValue
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const rows = await safeQuery('SELECT * FROM intervention_essais_electrique_frigorifique WHERE essais_id = ?', [id]);
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_essais_electrique_frigorifique WHERE intervention_id = ? ORDER BY essais_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(id, data) {
        const fields = [];
        const params = [];
        const normalizedData = {
            ...data,
            essai_marche_forcee_cas_ht: data.essai_marche_forcee_cas_ht ?? data.essai_marche_forcee_ht,
            essai_basculement_cas_defaut: data.essai_basculement_cas_defaut ?? data.essai_basculement_defaut
        };

        const allowed = [
            'essai_securite_bp',
            'essai_securite_hp',
            'essai_marche_forcee_cas_ht',
            'essai_basculement_cas_defaut'
        ];

        for (const key of allowed) {
            if (normalizedData[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(normalizedData[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await safeQuery(`UPDATE intervention_essais_electrique_frigorifique SET ${fields.join(', ')} WHERE essais_id = ?`, params);

        return this.findById(id);
    }

    static async delete(id) {
        const result = await safeQuery('DELETE FROM intervention_essais_electrique_frigorifique WHERE essais_id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = InterventionEssaisElectrique;
