-- Fix Database Schema Issues
-- This script fixes the datetime conflicts in the existing database

USE onssa;

-- Fix reclamations table datetime issues
UPDATE reclamations 
SET created_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- Add missing columns if they don't exist
ALTER TABLE reclamations 
ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at DATETIME(6) NULL,
ADD COLUMN IF NOT EXISTS observed_quantity INT NOT NULL DEFAULT 0;

-- Update any NULL values with defaults
UPDATE reclamations 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE reclamations 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

UPDATE reclamations 
SET observed_quantity = 0 
WHERE observed_quantity IS NULL;

-- Ensure reports table exists with correct structure
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('INVENTAIRE', 'ACTIVITE', 'PERFORMANCE', 'QUALITE', 'STOCK', 'RECLAMATIONS', 'UTILISATEURS') NOT NULL,
    status ENUM('EN_COURS', 'TERMINE', 'ERREUR', 'EXPIRE') NOT NULL DEFAULT 'EN_COURS',
    content TEXT,
    file_format VARCHAR(255),
    file_path VARCHAR(255),
    created_at DATETIME(6) NOT NULL DEFAULT NOW(),
    updated_at DATETIME(6) NULL,
    generated_at DATETIME(6) NULL,
    expires_at DATETIME(6) NULL,
    created_by_user_id BIGINT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Ensure tasks table exists with correct structure
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('A_FAIRE', 'EN_COURS', 'TERMINE', 'ANNULE') NOT NULL DEFAULT 'A_FAIRE',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    due_date DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT NOW(),
    updated_at DATETIME(6) NULL,
    completed_at DATETIME(6) NULL,
    assigned_to_user_id BIGINT NULL,
    created_by_user_id BIGINT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Fix any existing datetime issues in other tables
UPDATE products 
SET created_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE users 
SET created_at = NOW() 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- Add missing created_at columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT NOW();

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at DATETIME(6) NOT NULL DEFAULT NOW();

-- Update any NULL values
UPDATE products 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Show the current database structure
SHOW TABLES;
DESCRIBE reclamations;
DESCRIBE reports;
DESCRIBE tasks;
DESCRIBE products;
DESCRIBE users;
