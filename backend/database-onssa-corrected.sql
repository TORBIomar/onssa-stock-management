-- Create the onssa database
CREATE DATABASE IF NOT EXISTS onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the onssa database
USE onssa;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS reclamations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users table (matching Java User entity exactly)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role_active (role, active),
    INDEX idx_users_username_email (username, email)
) ENGINE=InnoDB;

-- Create products table (matching Java Product entity exactly)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(40) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    minimum_threshold INT NOT NULL DEFAULT 10,
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category_quantity (category, quantity),
    INDEX idx_products_expiry (expiry_date),
    INDEX idx_products_low_stock (quantity, minimum_threshold),
    INDEX idx_products_name_category (name, category)
) ENGINE=InnoDB;

-- Create reclamations table (matching Java Reclamation entity exactly)
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
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reclamations_status_created (status, createdAt),
    INDEX idx_reclamations_product_status (product_id, status),
    INDEX idx_reclamations_user_created (created_by_user_id, createdAt),
    INDEX idx_reclamations_status_updated (status, updatedAt)
) ENGINE=InnoDB;

-- Create tasks table for task management
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to_user_id BIGINT,
    created_by_user_id BIGINT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tasks_status_priority (status, priority),
    INDEX idx_tasks_assigned_due (assigned_to_user_id, due_date),
    INDEX idx_tasks_created_status (created_by_user_id, status),
    INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB;

-- Create reports table for report management
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    generated_by_user_id BIGINT NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'GENERATING',
    filters JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reports_type_status (report_type, status),
    INDEX idx_reports_user_created (generated_by_user_id, created_at),
    INDEX idx_reports_status_created (status, created_at)
) ENGINE=InnoDB;

-- Insert default admin user (password: admin123)
-- The password hash is for "admin123" using BCrypt
INSERT INTO users (username, passwordHash, email, role, active) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@onssa.ma', 'ADMIN', TRUE);

-- Insert sample products
INSERT INTO products (name, category, quantity, minimum_threshold, expiry_date) VALUES 
('Vaccin Anti-Rabique', 'VACCIN', 50, 10, '2025-12-31'),
('Médicament Anti-Parasitaire', 'MEDICAMENT_VETERINAIRE', 30, 5, '2025-06-30'),
('Aliment pour Bovins', 'ALIMENT_ANIMAL', 100, 20, '2025-09-30'),
('Produit Import/Export', 'IMPORT_EXPORT', 25, 5, '2025-12-31'),
('Vaccin Contre la Fièvre Aphteuse', 'VACCIN', 75, 15, '2025-08-15'),
('Antibiotique Vétérinaire', 'MEDICAMENT_VETERINAIRE', 45, 8, '2025-11-20'),
('Aliment pour Volailles', 'ALIMENT_ANIMAL', 120, 25, '2025-07-10'),
('Certificat Sanitaire', 'IMPORT_EXPORT', 10, 2, '2025-12-31');

-- Insert sample reclamations
INSERT INTO reclamations (titre, product_id, created_by_user_id, reason, observedQuantity, status) VALUES 
('Stock faible détecté', 1, 1, 'Quantité en dessous du seuil minimum', 8, 'OUVERTE'),
('Produit expiré', 2, 1, 'Date de péremption dépassée', 5, 'EN_COURS'),
('Qualité dégradée', 3, 1, 'Produit présentant des signes de détérioration', 15, 'TRAITEE'),
('Emballage endommagé', 4, 1, 'Emballage ouvert ou endommagé', 3, 'REJETEE');

-- Insert sample tasks
INSERT INTO tasks (title, description, assigned_to_user_id, created_by_user_id, priority, status, due_date) VALUES 
('Vérifier stock vaccins', 'Contrôler les quantités de vaccins en stock', 1, 1, 'HIGH', 'PENDING', DATE_ADD(NOW(), INTERVAL 2 DAY)),
('Audit qualité produits', 'Effectuer un audit qualité des produits', 1, 1, 'MEDIUM', 'IN_PROGRESS', DATE_ADD(NOW(), INTERVAL 5 DAY)),
('Formation équipe', 'Organiser une formation sur les nouveaux produits', 1, 1, 'LOW', 'COMPLETED', DATE_ADD(NOW(), INTERVAL -1 DAY));

-- Insert sample reports
INSERT INTO reports (title, report_type, generated_by_user_id, status, filters) VALUES 
('Rapport Stock Mensuel', 'STOCK_REPORT', 1, 'COMPLETED', '{"month": "2024-01", "category": "all"}'),
('Analyse Reclamations', 'RECLAMATION_ANALYSIS', 1, 'COMPLETED', '{"period": "last_month"}'),
('Rapport Performance', 'PERFORMANCE_REPORT', 1, 'GENERATING', '{"year": "2024"}');

-- Create additional performance indexes
CREATE INDEX idx_products_quantity_threshold ON products(quantity, minimum_threshold);
CREATE INDEX idx_reclamations_created_status ON reclamations(createdAt, status);
CREATE INDEX idx_users_active_role ON users(active, role);
CREATE INDEX idx_tasks_due_status ON tasks(due_date, status);
CREATE INDEX idx_reports_type_created ON reports(report_type, created_at);

-- Create composite indexes for common queries
CREATE INDEX idx_products_category_expiry ON products(category, expiry_date);
CREATE INDEX idx_reclamations_product_user ON reclamations(product_id, created_by_user_id);
CREATE INDEX idx_tasks_priority_due ON tasks(priority, due_date);

-- Create fulltext indexes for search functionality
CREATE FULLTEXT INDEX ft_products_name ON products(name);
CREATE FULLTEXT INDEX ft_reclamations_titre_reason ON reclamations(titre, reason);
CREATE FULLTEXT INDEX ft_tasks_title_description ON tasks(title, description);

-- Optimize table settings
ALTER TABLE users ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;
ALTER TABLE products ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;
ALTER TABLE reclamations ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;
ALTER TABLE tasks ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;
ALTER TABLE reports ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- Create views for common queries
CREATE VIEW v_low_stock_products AS
SELECT id, name, category, quantity, minimum_threshold, expiry_date
FROM products 
WHERE quantity <= minimum_threshold;

CREATE VIEW v_expired_products AS
SELECT id, name, category, quantity, expiry_date
FROM products 
WHERE expiry_date < CURDATE();

CREATE VIEW v_reclamations_summary AS
SELECT 
    r.id,
    r.titre,
    r.status,
    r.createdAt,
    p.name as product_name,
    u.username as created_by
FROM reclamations r
JOIN products p ON r.product_id = p.id
JOIN users u ON r.created_by_user_id = u.id;

CREATE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM products WHERE quantity <= minimum_threshold) as low_stock_count,
    (SELECT COUNT(*) FROM products WHERE expiry_date < CURDATE()) as expired_count,
    (SELECT COUNT(*) FROM reclamations WHERE status = 'OUVERTE') as open_reclamations,
    (SELECT COUNT(*) FROM tasks WHERE status = 'PENDING') as pending_tasks,
    (SELECT COUNT(*) FROM users WHERE active = TRUE) as active_users;
