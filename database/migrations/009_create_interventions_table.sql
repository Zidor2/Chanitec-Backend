-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
    intervention_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id CHAR(36) DEFAULT NULL,
    client_id CHAR(36) DEFAULT NULL,
    site_id CHAR(36) DEFAULT NULL,
    intervention_date DATE NOT NULL,
    heure_arrive TIME DEFAULT NULL,
    heure_depart TIME DEFAULT NULL,
    object TEXT DEFAULT NULL,
    raison TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_interventions_quote_id (quote_id),
    INDEX idx_interventions_client_id (client_id),
    INDEX idx_interventions_site_id (site_id),
    CONSTRAINT fk_interventions_quote_id FOREIGN KEY (quote_id)
        REFERENCES quotes(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_interventions_client_id FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_interventions_site_id FOREIGN KEY (site_id)
        REFERENCES sites(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
