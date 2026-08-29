CREATE TABLE IF NOT EXISTS intervention_essais_electrique_frigorifique (
    essais_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    essai_securite_bp TINYINT(1) DEFAULT NULL,
    essai_securite_hp TINYINT(1) DEFAULT NULL,
    essai_marche_forcee_cas_ht TINYINT(1) DEFAULT NULL,
    essai_basculement_cas_defaut TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (essais_id),
    KEY idx_intervention_essais_electrique_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_essais_electrique_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
