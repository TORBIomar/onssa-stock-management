-- Complete Database Cleanup Script
-- This will remove ALL data and recreate the database structure

-- Drop and recreate the database completely
DROP DATABASE IF EXISTS onssa;
CREATE DATABASE onssa;
USE onssa;

-- The application will automatically create all tables with correct structure
-- when it starts with spring.jpa.hibernate.ddl-auto=update

-- No need to manually create tables - Hibernate will do this automatically
-- This ensures the schema matches exactly with the current entity definitions
