-- Drop and recreate the entire database
DROP DATABASE IF EXISTS onssa;
CREATE DATABASE onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE onssa;

-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'AGENT')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create reclamations table
CREATE TABLE reclamations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (status IN ('EN_ATTENTE', 'EN_COURS', 'RESOLUE', 'FERMEE')),
    priority VARCHAR(10) DEFAULT 'MOYENNE' CHECK (priority IN ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE')),
    user_id BIGINT,
    product_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert sample roles
INSERT INTO roles (name) VALUES 
('ADMIN'),
('AGENT');

-- Insert sample users
INSERT INTO users (username, email, password, role, active) VALUES
('admin', 'admin@onssa.ma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', TRUE),
('agent1', 'agent1@onssa.ma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AGENT', TRUE),
('agent2', 'agent2@onssa.ma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AGENT', TRUE),
('inspector', 'inspector@onssa.ma', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'AGENT', TRUE);

-- Insert sample products
INSERT INTO products (name, description, category, price, stock_quantity, min_stock_level) VALUES
('Vaccin Antirabique', 'Vaccin contre la rage pour animaux domestiques', 'VACCINS', 45.50, 120, 20),
('Test Brucellose', 'Kit de test rapide pour détecter la brucellose', 'TESTS', 25.00, 85, 15),
('Désinfectant Virkon', 'Désinfectant à large spectre pour surfaces', 'DESINFECTANTS', 18.75, 200, 30),
('Antibiotique Pénicilline', 'Traitement antibiotique pour infections bactériennes', 'MEDICAMENTS', 32.00, 150, 25),
('Seringue Jetable 5ml', 'Seringues stériles à usage unique', 'MATERIEL', 0.85, 500, 100),
('Gants Latex', 'Gants de protection en latex (boîte de 100)', 'PROTECTION', 12.50, 75, 10),
('Thermomètre Digital', 'Thermomètre électronique pour animaux', 'INSTRUMENTS', 28.90, 45, 8),
('Masque FFP2', 'Masques de protection respiratoire (boîte de 20)', 'PROTECTION', 15.60, 95, 15);

-- Insert sample reclamations
INSERT INTO reclamations (title, description, status, priority, user_id, product_id) VALUES
('Vaccin périmé reçu', 'Le lot de vaccins antirabiques reçu hier a une date d''expiration dépassée. Nous avons besoin d''un remplacement urgent.', 'EN_COURS', 'HAUTE', 2, 1),
('Problème qualité désinfectant', 'Le désinfectant Virkon ne mousse pas correctement et semble moins efficace que d''habitude.', 'EN_ATTENTE', 'MOYENNE', 3, 3),
('Rupture de stock seringues', 'Nous sommes en rupture de stock de seringues 5ml. Pouvez-vous accélérer la livraison?', 'RESOLUE', 'HAUTE', 2, 5),
('Thermomètre défaillant', 'Le thermomètre digital acheté la semaine dernière ne fonctionne plus. Demande de remplacement sous garantie.', 'EN_ATTENTE', 'BASSE', 4, 7),
('Livraison incomplète', 'La dernière commande d''antibiotiques était incomplète. Il manquait 20 unités sur les 100 commandées.', 'EN_COURS', 'MOYENNE', 3, 4);

-- Show success message
SELECT 'Database recreated successfully with sample data!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_reclamations FROM reclamations;
