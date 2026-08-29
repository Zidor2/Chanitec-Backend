CREATE TABLE IF NOT EXISTS intervention_liaisons_electriques_frigorifiques (
    liaisons_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    verification_fixation_circuits_frigorifiques TINYINT(1) DEFAULT NULL,
    verification_calorifuge_circuits_frigorifiques TINYINT(1) DEFAULT NULL,
    verification_fixation_circuits_electriques TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (liaisons_id),
    KEY idx_intervention_liaisons_electriques_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_liaisons_electriques_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
