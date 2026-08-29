const { safeQuery } = require('../utils/databaseUtils');

const normalizeSplitCode = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
};

const normalizeMesureRelevePayload = (data = {}) => {
    const splitCode = normalizeSplitCode(data.split_code ?? data.split_id);

    return {
        intervention_id: data.intervention_id ?? null,
        split_code: splitCode,
        tension_generale_climatiseur: data.general_voltage ?? data.tension_generale_climatiseur ?? null,
        intensite_generale_climatiseur: data.general_current ?? data.intensite_generale_climatiseur ?? null,
        intensite_compresseur: data.compressor_current ?? data.intensite_compresseur ?? null,
        intensite_moteurs_ventilateurs_cond: data.condenser_fan_current ?? data.intensite_moteurs_ventilateurs_cond ?? null,
        intensite_moteurs_ventilateurs_evap: data.evaporator_fan_current ?? data.intensite_moteurs_ventilateurs_evap ?? null,
        haute_pression_hp: data.high_pressure ?? data.haute_pression_hp ?? null,
        basse_pression_bp: data.low_pressure ?? data.basse_pression_bp ?? null,
        temperature_soufflage: data.supply_air_temp ?? data.temperature_soufflage ?? null,
        temperature_local: data.room_temp ?? data.temperature_local ?? null,
        debit_air_soufflage: data.supply_air_flow ?? data.debit_air_soufflage ?? null
    };
};

class InterventionMesureReleve {
    static async create(data) {
        const payload = normalizeMesureRelevePayload(data);

        const result = await safeQuery(
            `INSERT INTO intervention_mesure_releve (
                intervention_id,
                split_code,
                tension_generale_climatiseur,
                intensite_generale_climatiseur,
                intensite_compresseur,
                intensite_moteurs_ventilateurs_cond,
                intensite_moteurs_ventilateurs_evap,
                haute_pression_hp,
                basse_pression_bp,
                temperature_soufflage,
                temperature_local,
                debit_air_soufflage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.intervention_id,
                payload.split_code,
                payload.tension_generale_climatiseur,
                payload.intensite_generale_climatiseur,
                payload.intensite_compresseur,
                payload.intensite_moteurs_ventilateurs_cond,
                payload.intensite_moteurs_ventilateurs_evap,
                payload.haute_pression_hp,
                payload.basse_pression_bp,
                payload.temperature_soufflage,
                payload.temperature_local,
                payload.debit_air_soufflage
            ]
        );

        return this.findById(result.insertId);
    }

    static async findById(mesure_releve_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_mesure_releve WHERE mesure_releve_id = ?',
            [mesure_releve_id]
        );
        return rows[0];
    }

    static async findByInterventionId(intervention_id) {
        const rows = await safeQuery(
            'SELECT * FROM intervention_mesure_releve WHERE intervention_id = ? ORDER BY mesure_releve_id DESC LIMIT 1',
            [intervention_id]
        );
        return rows[0];
    }

    static async update(mesure_releve_id, data) {
        const fields = [];
        const params = [];

        const allowed = [
            ['split_id', 'split_code'],
            ['general_voltage', 'tension_generale_climatiseur'],
            ['general_current', 'intensite_generale_climatiseur'],
            ['compressor_current', 'intensite_compresseur'],
            ['condenser_fan_current', 'intensite_moteurs_ventilateurs_cond'],
            ['evaporator_fan_current', 'intensite_moteurs_ventilateurs_evap'],
            ['high_pressure', 'haute_pression_hp'],
            ['low_pressure', 'basse_pression_bp'],
            ['supply_air_temp', 'temperature_soufflage'],
            ['room_temp', 'temperature_local'],
            ['supply_air_flow', 'debit_air_soufflage']
        ];

        for (const [inputKey, dbKey] of allowed) {
            const value = data[inputKey] ?? data[dbKey];
            if (value !== undefined) {
                fields.push(`${dbKey} = ?`);
                params.push(inputKey === 'split_id' ? normalizeSplitCode(value) : value);
            }
        }

        if (fields.length === 0) {
            return this.findById(mesure_releve_id);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(mesure_releve_id);

        await safeQuery(
            `UPDATE intervention_mesure_releve SET ${fields.join(', ')} WHERE mesure_releve_id = ?`,
            params
        );

        return this.findById(mesure_releve_id);
    }

    static async delete(mesure_releve_id) {
        const result = await safeQuery(
            'DELETE FROM intervention_mesure_releve WHERE mesure_releve_id = ?',
            [mesure_releve_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = InterventionMesureReleve;
module.exports.normalizeMesureRelevePayload = normalizeMesureRelevePayload;
