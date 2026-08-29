-- Create intervention_unite_exterieure table
CREATE TABLE IF NOT EXISTS intervention_unite_exterieure (
    unite_exterieure_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    absence_echauffement TINYINT(1) DEFAULT NULL,
    absence_vibration TINYINT(1) DEFAULT NULL,
    serrage_connexions_electriques TINYINT(1) DEFAULT NULL,
    depoussierage_cablage_electrique TINYINT(1) DEFAULT NULL,
    nettoyage_condenseur_eau_produit_detergent TINYINT(1) DEFAULT NULL,
    verification_unite_exterieure TINYINT(1) DEFAULT NULL,
    verification_fonctionnement_variateur_vitesse TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (unite_exterieure_id),
    KEY idx_intervention_unite_exterieure_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_unite_exterieure_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
