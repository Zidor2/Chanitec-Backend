-- Migration: Migrate splits table to use auto-increment id as primary key
-- Old: Code was PRIMARY KEY
-- New: id is AUTO_INCREMENT PRIMARY KEY, Code is UNIQUE

-- Check if splits table exists and handle migration
CREATE TABLE IF NOT EXISTS splits_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    puissance DECIMAL(10, 2),
    site_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_splits_code (Code),
    INDEX idx_splits_site_id (site_id)
);

-- Copy data from old table if it exists
INSERT INTO splits_new (Code, name, description, puissance, site_id, created_at, updated_at)
SELECT Code, name, description, puissance, site_id, created_at, updated_at
FROM splits
WHERE NOT EXISTS (SELECT 1 FROM splits_new LIMIT 1);

-- Drop old table
DROP TABLE IF EXISTS splits;

-- Rename new table
ALTER TABLE splits_new RENAME TO splits;
