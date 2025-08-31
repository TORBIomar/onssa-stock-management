-- Fix the reclamations table structure
-- Run this in phpMyAdmin or MySQL Workbench

-- Drop the existing table if it exists
DROP TABLE IF EXISTS reclamations;

-- Create the table with the correct structure
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

-- Insert sample data if needed
-- INSERT INTO reclamations (titre, product_id, created_by_user_id, reason, observedQuantity, status) 
-- VALUES ('Test Reclamation', 1, 1, 'Test reason', 5, 'OUVERTE');
