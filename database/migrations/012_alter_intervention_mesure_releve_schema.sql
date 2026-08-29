ALTER TABLE intervention_mesure_releve
    ADD COLUMN IF NOT EXISTS split_code VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS tension_generale_climatiseur DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS intensite_generale_climatiseur DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS intensite_compresseur DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS intensite_moteurs_ventilateurs_cond DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS intensite_moteurs_ventilateurs_evap DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS haute_pression_hp DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS basse_pression_bp DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS temperature_soufflage DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS temperature_local DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS debit_air_soufflage DECIMAL(10,2) DEFAULT NULL;

ALTER TABLE intervention_mesure_releve
    DROP COLUMN IF EXISTS split_id,
    DROP COLUMN IF EXISTS clim_number,
    DROP COLUMN IF EXISTS general_voltage,
    DROP COLUMN IF EXISTS general_current,
    DROP COLUMN IF EXISTS compressor_current,
    DROP COLUMN IF EXISTS condenser_fan_current,
    DROP COLUMN IF EXISTS evaporator_fan_current,
    DROP COLUMN IF EXISTS high_pressure,
    DROP COLUMN IF EXISTS low_pressure,
    DROP COLUMN IF EXISTS supply_air_temp,
    DROP COLUMN IF EXISTS room_temp,
    DROP COLUMN IF EXISTS supply_air_flow;

ALTER TABLE intervention_mesure_releve
    MODIFY COLUMN split_code VARCHAR(50) NOT NULL DEFAULT '';
