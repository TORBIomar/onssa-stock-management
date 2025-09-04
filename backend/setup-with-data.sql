-- Complete database setup with sample data for GSRV System
-- This will create the database structure AND add sample data

-- Create the onssa database
CREATE DATABASE IF NOT EXISTS onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the onssa database
USE onssa;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS reclamations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'AGENT') NOT NULL DEFAULT 'AGENT',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('VACCIN', 'MEDICAMENT_VETERINAIRE', 'ALIMENT_ANIMAL', 'IMPORT_EXPORT') NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 10,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create reclamations table
CREATE TABLE reclamations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    observed_quantity INT NOT NULL,
    status ENUM('OUVERTE', 'EN_COURS', 'TRAITEE', 'REJETEE') NOT NULL DEFAULT 'OUVERTE',
    product_id BIGINT,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample users
INSERT INTO users (username, password_hash, email, role, active) VALUES 
-- Password for all users is 'admin123' (BCrypt hash)
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin@onssa.ma', 'ADMIN', TRUE),
('agent1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'agent1@onssa.ma', 'AGENT', TRUE),
('agent2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'agent2@onssa.ma', 'AGENT', TRUE),
('supervisor', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'supervisor@onssa.ma', 'ADMIN', TRUE);

-- Insert sample products
INSERT INTO products (name, category, quantity, minimum_threshold, expiry_date) VALUES 
('Vaccin Antirabique', 'VACCIN', 150, 20, '2025-12-31'),
('Vaccin FMD', 'VACCIN', 75, 15, '2025-08-15'),
('Antibiotique Pénicilline', 'MEDICAMENT_VETERINAIRE', 200, 30, '2025-06-30'),
('Anti-inflammatoire', 'MEDICAMENT_VETERINAIRE', 45, 25, '2025-09-15'),
('Aliment Bovin Premium', 'ALIMENT_ANIMAL', 500, 100, '2024-12-01'),
('Complément Vitaminé', 'ALIMENT_ANIMAL', 80, 20, '2025-03-20'),
('Produit Import Spécial', 'IMPORT_EXPORT', 25, 10, '2025-11-10'),
('Matériel Vétérinaire', 'IMPORT_EXPORT', 60, 15, '2025-07-25');

-- Insert sample reclamations
INSERT INTO reclamations (titre, reason, observed_quantity, status, product_id, user_id) VALUES 
('Problème efficacité vaccin', 'Le vaccin antirabique semble moins efficace que prévu', 10, 'OUVERTE', 1, 2),
('Stock insuffisant', 'Rupture de stock d\'antibiotique', 5, 'EN_COURS', 3, 2),
('Qualité douteuse', 'Aliment bovin avec odeur suspecte', 50, 'TRAITEE', 5, 3),
('Date expiration proche', 'Produits bientôt périmés non signalés', 15, 'OUVERTE', 4, 2),
('Problème livraison', 'Retard dans la livraison des compléments', 20, 'EN_COURS', 6, 3);

-- Verify data was inserted
SELECT 'Database setup completed successfully!' as status;
SELECT 'Users created:' as info;
SELECT username, email, role, active FROM users;

SELECT 'Products created:' as info;
SELECT name, category, quantity, minimum_threshold FROM products;

SELECT 'Reclamations created:' as info;
SELECT titre, status, product_id, user_id FROM reclamations;
