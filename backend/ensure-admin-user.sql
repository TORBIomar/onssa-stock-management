-- Ensure admin user exists with correct credentials
-- This script will create or update the admin user
-- Password: admin123

USE onssa;

-- Check current users
SELECT 'Current users in database:' as status;
SELECT id, username, role, active FROM users;

-- Create or update admin user
-- BCrypt hash for 'admin123': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi
INSERT INTO users (username, password_hash, email, role, active, created_at, updated_at) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@gsrv.com', 'ADMIN', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi',
    role = 'ADMIN',
    active = TRUE,
    updated_at = NOW();

-- Create a test agent user as well
-- BCrypt hash for 'agent123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
INSERT INTO users (username, password_hash, email, role, active, created_at, updated_at) 
VALUES ('agent', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'agent@gsrv.com', 'AGENT', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    role = 'AGENT',
    active = TRUE,
    updated_at = NOW();

-- Verify users were created/updated
SELECT 'Users after update:' as status;
SELECT id, username, role, active, created_at FROM users;

-- Insert some sample products if none exist
INSERT IGNORE INTO products (name, category, quantity, minimum_threshold, expiry_date, created_at, updated_at) VALUES 
('Vaccin Anti-Rabique', 'VACCIN', 50, 10, '2025-12-31', NOW(), NOW()),
('Médicament Anti-Parasitaire', 'MEDICAMENT_VETERINAIRE', 30, 5, '2025-06-30', NOW(), NOW()),
('Aliment pour Bovins', 'ALIMENT_ANIMAL', 100, 20, '2025-09-30', NOW(), NOW()),
('Produit Import/Export', 'IMPORT_EXPORT', 25, 5, '2025-12-31', NOW(), NOW());

-- Insert some sample reclamations if none exist
INSERT IGNORE INTO reclamations (titre, product_id, created_by_user_id, reason, observed_quantity, status, created_at, updated_at) VALUES 
('Stock faible détecté', 1, 1, 'Quantité en dessous du seuil minimum', 8, 'OUVERTE', NOW(), NOW()),
('Produit expiré', 2, 1, 'Date de péremption dépassée', 5, 'EN_COURS', NOW(), NOW()),
('Problème qualité', 3, 1, 'Produit défectueux détecté', 12, 'OUVERTE', NOW(), NOW());

SELECT 'Database setup completed successfully!' as status;
SELECT 'Login credentials:' as info;
SELECT 'Admin - Username: admin, Password: admin123' as admin_login;
SELECT 'Agent - Username: agent, Password: agent123' as agent_login;
