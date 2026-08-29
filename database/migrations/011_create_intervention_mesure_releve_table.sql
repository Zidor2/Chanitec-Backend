-- Create intervention_mesure_releve table
CREATE TABLE IF NOT EXISTS intervention_mesure_releve (
    mesure_releve_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    split_code VARCHAR(50) NOT NULL DEFAULT '',
    tension_generale_climatiseur DECIMAL(10,2) DEFAULT NULL,
    intensite_generale_climatiseur DECIMAL(10,2) DEFAULT NULL,
    intensite_compresseur DECIMAL(10,2) DEFAULT NULL,
    intensite_moteurs_ventilateurs_cond DECIMAL(10,2) DEFAULT NULL,
    intensite_moteurs_ventilateurs_evap DECIMAL(10,2) DEFAULT NULL,
    haute_pression_hp DECIMAL(10,2) DEFAULT NULL,
    basse_pression_bp DECIMAL(10,2) DEFAULT NULL,
    temperature_soufflage DECIMAL(10,2) DEFAULT NULL,
    temperature_local DECIMAL(10,2) DEFAULT NULL,
    debit_air_soufflage DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (mesure_releve_id),
    KEY idx_intervention_mesure_releve_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_mesure_releve_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
