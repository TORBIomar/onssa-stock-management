-- Clean database schema for GSRV system
-- This schema matches the updated entity classes that use String instead of enums

-- Drop and recreate the onssa database cleanly
DROP DATABASE IF EXISTS onssa;
CREATE DATABASE onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE onssa;

-- Create users table (matching User entity exactly)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL
);

-- Create products table (matching Product entity exactly)
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

-- Create reclamations table (matching Reclamation entity exactly)
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

-- Create tasks table
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'A_FAIRE',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    due_date DATETIME NOT NULL,
    assigned_to_user_id BIGINT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    completed_at DATETIME NULL,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Create reports table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    content TEXT,
    file_path VARCHAR(500),
    file_format VARCHAR(20),
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    generated_at DATETIME NULL,
    expires_at DATETIME NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, email, role, active) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@onssa.ma', 'ADMIN', TRUE);

-- Insert a simple test user (password: test123)
INSERT INTO users (username, password_hash, email, role, active) VALUES 
('test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'test@test.com', 'ADMIN', TRUE);

-- Insert sample products
INSERT INTO products (name, category, quantity, minimum_threshold, expiry_date) VALUES 
('Vaccin Anti-Rabique', 'VACCIN', 50, 10, '2025-12-31'),
('Médicament Anti-Parasitaire', 'MEDICAMENT_VETERINAIRE', 30, 5, '2025-06-30'),
('Aliment pour Bovins', 'ALIMENT_ANIMAL', 100, 20, '2025-09-30'),
('Produit Import/Export', 'IMPORT_EXPORT', 25, 5, '2025-12-31');

-- Insert sample reclamations
INSERT INTO reclamations (titre, product_id, created_by_user_id, reason, observedQuantity, status) VALUES 
('Stock faible détecté', 1, 1, 'Quantité en dessous du seuil minimum', 8, 'OUVERTE'),
('Produit expiré', 2, 1, 'Quantité en dessous du seuil minimum', 5, 'EN_COURS');

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, created_by_user_id) VALUES 
('Vérifier stock vaccins', 'Vérifier et commander si nécessaire les vaccins en stock faible', 'A_FAIRE', 'HIGH', DATE_ADD(NOW(), INTERVAL 2 DAY), 1),
('Audit qualité produits', 'Effectuer un audit qualité sur les produits expirant bientôt', 'EN_COURS', 'MEDIUM', DATE_ADD(NOW(), INTERVAL 5 DAY), 1),
('Formation équipe', 'Organiser une formation sur les nouveaux produits', 'A_FAIRE', 'LOW', DATE_ADD(NOW(), INTERVAL 10 DAY), 1);

-- Insert sample reports
INSERT INTO reports (title, description, type, status, created_by_user_id) VALUES 
('Rapport Mensuel Stock', 'Rapport d\'inventaire mensuel des stocks', 'INVENTAIRE', 'TERMINE', 1),
('Analyse Réclamations Q1', 'Analyse des réclamations du premier trimestre', 'QUALITE', 'EN_COURS', 1),
('Performance Système', 'Rapport de performance du système GSRV', 'PERFORMANCE', 'A_FAIRE', 1);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_quantity ON products(quantity);
CREATE INDEX idx_reclamations_status ON reclamations(status);
CREATE INDEX idx_reclamations_product ON reclamations(product_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Users:' as info;
SELECT username, role, active FROM users;
SELECT 'Products:' as info;
SELECT name, category, quantity FROM products;
SELECT 'Reclamations:' as info;
SELECT titre, status FROM reclamations;
SELECT 'Tasks:' as info;
SELECT title, status, priority FROM tasks;
SELECT 'Reports:' as info;
SELECT title, type, status FROM reports;
