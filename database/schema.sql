-- MySQL Schema for Chanitec Pricing System

-- Create and use the database
CREATE DATABASE IF NOT EXISTS Chanitec;
USE Chanitec;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    client_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Items table (catalog of available items)
CREATE TABLE IF NOT EXISTS items (
    id CHAR(36) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 0 COMMENT 'Available quantity in inventory',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    internal_id INT AUTO_INCREMENT PRIMARY KEY,
    id VARCHAR(36) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    object TEXT,
    date VARCHAR(255) NOT NULL,
    supply_description TEXT,
    labor_description TEXT,
    supply_exchange_rate DECIMAL(10, 4) NOT NULL,
    supply_margin_rate DECIMAL(10, 4) NOT NULL,
    labor_exchange_rate DECIMAL(10, 4) NOT NULL,
    labor_margin_rate DECIMAL(10, 4) NOT NULL,
    total_supplies_ht DECIMAL(10, 2) NOT NULL,
    total_labor_ht DECIMAL(10, 2) NOT NULL,
    total_ht DECIMAL(10, 2) NOT NULL,
    tva DECIMAL(10, 2) NOT NULL,
    total_ttc DECIMAL(10, 2) NOT NULL,
    remise FLOAT DEFAULT 0.00 COMMENT 'Discount/rebate amount applied to the quote',
    HBC FLOAT DEFAULT 0.00 COMMENT 'Percentage-based adjustment applied after remise',
    parentId VARCHAR(36) DEFAULT NULL,
    confirmed TINYINT(1) DEFAULT 0 COMMENT 'Whether the quote has been confirmed',
    reminderDate DATE NULL COMMENT 'Reminder date for follow-up',
    split_id VARCHAR(50) NULL COMMENT 'Reference to split/group ID',
    number_chanitec INT NULL COMMENT 'Chanitec order number',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Supply items table
CREATE TABLE IF NOT EXISTS supply_items (
    id CHAR(36) PRIMARY KEY,
    quote_id CHAR(36) NOT NULL,
    item_id CHAR(36) NULL COMMENT 'Reference to catalog item',
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    price_euro DECIMAL(10, 2) NOT NULL,
    price_dollar DECIMAL(10, 2) NOT NULL,
    unit_price_dollar DECIMAL(10, 2) NOT NULL,
    total_price_dollar DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Labor items table
CREATE TABLE IF NOT EXISTS labor_items (
    id CHAR(36) PRIMARY KEY,
    quote_id CHAR(36) NOT NULL,
    description TEXT NOT NULL,
    nb_technicians INT NOT NULL,
    nb_hours DECIMAL(10, 2) NOT NULL,
    weekend_multiplier DECIMAL(10, 2) NOT NULL,
    price_euro DECIMAL(10, 2) NOT NULL,
    price_dollar DECIMAL(10, 2) NOT NULL,
    unit_price_dollar DECIMAL(10, 2) NOT NULL,
    total_price_dollar DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Descriptions/Comments table (for supply and labor descriptions)
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Price Offers table
CREATE TABLE IF NOT EXISTS price_offers (
    id VARCHAR(36) PRIMARY KEY,
    quote_id VARCHAR(36) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    site_name VARCHAR(255) NOT NULL,
    object TEXT,
    date DATE NOT NULL,
    supply_description TEXT,
    supply_total_ht DECIMAL(10,2) NOT NULL,
    labor_description TEXT,
    labor_total_ht DECIMAL(10,2) NOT NULL,
    total_ht DECIMAL(10,2) NOT NULL,
    tva DECIMAL(10,2) NOT NULL,
    total_ttc DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Users table for authentication and authorization
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(60) NOT NULL DEFAULT 'viewer',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username)
);

-- Drop existing indexes if they exist
-- Note: DROP INDEX IF EXISTS requires MySQL 8.0+
-- DROP INDEX IF EXISTS idx_clients_name ON clients;
-- DROP INDEX IF EXISTS idx_sites_client_id ON sites;
-- DROP INDEX IF EXISTS idx_sites_name ON sites;
-- DROP INDEX IF EXISTS idx_quotes_date ON quotes;
-- DROP INDEX IF EXISTS idx_quotes_client_name ON quotes;
-- DROP INDEX IF EXISTS idx_supply_items_quote_id ON supply_items;
-- DROP INDEX IF EXISTS idx_labor_items_quote_id ON labor_items;
-- DROP INDEX IF EXISTS idx_items_description ON items;

-- Create indexes for better performance
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_sites_client_id ON sites(client_id);
CREATE INDEX idx_sites_name ON sites(name);
CREATE INDEX idx_quotes_date ON quotes(date);
CREATE INDEX idx_quotes_client_name ON quotes(client_name);
CREATE INDEX idx_supply_items_quote_id ON supply_items(quote_id);
CREATE INDEX idx_labor_items_quote_id ON labor_items(quote_id);
CREATE INDEX idx_items_description ON items(description);

-- Add constraints
ALTER TABLE clients
    ADD CONSTRAINT chk_client_email CHECK (email IS NULL OR email LIKE '%@%.%');

ALTER TABLE quotes
    ADD CONSTRAINT chk_quote_rates CHECK (
        supply_exchange_rate > 0 AND
        supply_margin_rate > 0 AND
        labor_exchange_rate > 0 AND
        labor_margin_rate > 0
    );

ALTER TABLE supply_items
    ADD CONSTRAINT chk_supply_quantity CHECK (quantity > 0),
    ADD CONSTRAINT chk_supply_prices CHECK (
        price_euro > 0 AND
        price_dollar > 0 AND
        unit_price_dollar > 0 AND
        total_price_dollar > 0
    );

ALTER TABLE labor_items
    ADD CONSTRAINT chk_labor_technicians CHECK (nb_technicians > 0),
    ADD CONSTRAINT chk_labor_hours CHECK (nb_hours > 0),
    ADD CONSTRAINT chk_labor_multiplier CHECK (weekend_multiplier >= 1),
    ADD CONSTRAINT chk_labor_prices CHECK (
        price_euro > 0 AND
        price_dollar > 0 AND
        unit_price_dollar > 0 AND
        total_price_dollar > 0
    );
-- Add missing columns to quotes table if they don't exist
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS reminderDate DATE NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS split_id VARCHAR(36) NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS number_chanitec VARCHAR(255) NULL;
