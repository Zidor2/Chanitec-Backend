-- Migration: 005_create_users_table.sql
-- Description: Create users table for authentication and authorization

USE Chanitec;

-- Users table for authentication and authorization
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(60) NOT NULL DEFAULT 'viewer',
    createdAt DATE DEFAULT (CURRENT_DATE),
    updatedAt DATE DEFAULT (CURRENT_DATE) ON UPDATE CURRENT_DATE,
    INDEX idx_users_username (username)
);