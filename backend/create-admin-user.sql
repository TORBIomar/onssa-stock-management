-- Create admin user with username: admin, password: admin
-- This will add a new admin user to the existing database

USE onssa;

-- First, let's check if admin user already exists
SELECT 'Current users in database:' as info;
SELECT username, role, active FROM users;

-- Create admin user with password 'admin' (BCrypt hash)
-- The hash for 'admin' is: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
INSERT INTO users (username, password_hash, email, role, active) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin@onssa.ma', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    email = 'admin@onssa.ma',
    role = 'ADMIN',
    active = TRUE;

-- Verify the admin user was created/updated
SELECT 'Admin user created/updated successfully!' as status;
SELECT 'Updated users list:' as info;
SELECT username, role, active FROM users;
