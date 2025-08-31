-- Create the onssa database
CREATE DATABASE IF NOT EXISTS onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the onssa database
USE onssa;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS reclamations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(40) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 10,
    expiry_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL
);

-- Create reclamations table
CREATE TABLE reclamations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    product_id BIGINT NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    observedQuantity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OUVERTE',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
('ADMIN'),
('AGENT'),
('VETERINAIRE');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, role_id) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@onssa.ma', 1);

-- Insert sample products
INSERT INTO products (name, category, quantity, minimum_threshold, expiry_date) VALUES 
('Vaccin Anti-Rabique', 'VACCIN', 50, 10, '2025-12-31'),
('Médicament Anti-Parasitaire', 'MEDICAMENT_VETERINAIRE', 30, 5, '2025-06-30'),
('Aliment pour Bovins', 'ALIMENT_ANIMAL', 100, 20, '2025-09-30'),
('Produit Import/Export', 'IMPORT_EXPORT', 25, 5, '2025-12-31');

-- Insert sample reclamations
INSERT INTO reclamations (titre, product_id, created_by_user_id, reason, observedQuantity, status) VALUES 
('Stock faible détecté', 1, 1, 'Quantité en dessous du seuil minimum', 8, 'OUVERTE'),
('Produit expiré', 2, 1, 'Date de péremption dépassée', 5, 'EN_COURS');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_quantity ON products(quantity);
CREATE INDEX idx_reclamations_status ON reclamations(status);
CREATE INDEX idx_reclamations_product ON reclamations(product_id);
CREATE INDEX idx_users_role ON users(role_id);

-- Grant permissions (adjust as needed for your MySQL setup)
-- GRANT ALL PRIVILEGES ON onssa.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;
