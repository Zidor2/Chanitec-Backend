CREATE TABLE IF NOT EXISTS intervention_observations (
    observation_id INT NOT NULL AUTO_INCREMENT,
    intervention_id INT NOT NULL,
    observations_client TEXT DEFAULT NULL,
    observations_chanic TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (observation_id),
    UNIQUE KEY uk_intervention_observations_intervention_id (intervention_id),
    KEY idx_intervention_observations_intervention_id (intervention_id),
    CONSTRAINT fk_intervention_observations_intervention_id FOREIGN KEY (intervention_id)
        REFERENCES interventions (intervention_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
