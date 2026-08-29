CREATE TABLE IF NOT EXISTS intervention_coffret_electrique_commande_puissance (
    coffret_electrique_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    nettoyage_depoussierage_coffret_electrique TINYINT(1) DEFAULT NULL,
    serrage_connexions_electriques TINYINT(1) DEFAULT NULL,
    etat_fusibles_coffret_puissance TINYINT(1) DEFAULT NULL,
    etat_voyants_fonctionnement_sirene TINYINT(1) DEFAULT NULL,
    verification_fonctionnement_minuterie TINYINT(1) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (coffret_electrique_id),
    KEY idx_intervention_coffret_electrique_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_coffret_electrique_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
