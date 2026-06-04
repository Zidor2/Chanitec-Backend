-- Migration: Create planning_sites table
-- Links planning records to sites for site-specific planning

CREATE TABLE IF NOT EXISTS planning_sites (
    id VARCHAR(36) PRIMARY KEY,
    planning_id VARCHAR(36) NOT NULL,
    site_id VARCHAR(36) NOT NULL,
    planned_date DATETIME,
    effective_date DATETIME,
    status ENUM('planned','active','finished') DEFAULT 'planned',
    is_delayed TINYINT(1) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (planning_id) REFERENCES planning(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_planning_sites_planning_id (planning_id),
    INDEX idx_planning_sites_site_id (site_id),
    INDEX idx_planning_sites_status (status)
);
