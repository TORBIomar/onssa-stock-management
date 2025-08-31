# Database Fix Guide for GSRV System

## Problem Description
The Spring Boot application is failing to start due to database schema conflicts, specifically:
- Invalid datetime values (`0000-00-00 00:00:00`) in existing tables
- Missing columns that the new entity structure requires
- Schema mismatch between existing database and new JPA entities

## Solution
We need to fix the database schema without losing existing data. This is done by:
1. Updating invalid datetime values to valid ones
2. Adding missing columns with proper defaults
3. Ensuring all required tables exist with correct structure

## Files Created
- `fix-database-schema.sql` - SQL script to fix the database
- `fix-database.ps1` - PowerShell script to display the fix
- `reset-database.bat` - Windows batch file for easy execution
- `DATABASE-FIX-README.md` - This file

## How to Fix

### Option 1: Using phpMyAdmin (Recommended)
1. **Stop the Spring Boot application** if it's running
2. **Open phpMyAdmin** in your browser (usually http://localhost/phpmyadmin)
3. **Select the 'onssa' database**
4. **Go to the SQL tab**
5. **Copy and paste the contents of `fix-database-schema.sql`**
6. **Click 'Go' to execute**
7. **Restart the Spring Boot application**

### Option 2: Using MySQL Command Line
1. **Stop the Spring Boot application**
2. **Open MySQL command line** or MySQL Workbench
3. **Run the SQL commands from `fix-database-schema.sql`**
4. **Restart the Spring Boot application**

### Option 3: Using the Batch File
1. **Double-click `reset-database.bat`**
2. **Follow the displayed instructions**
3. **Run the SQL commands in phpMyAdmin**
4. **Restart the application**

## What the Fix Does
1. **Updates invalid datetime values** to current timestamp
2. **Adds missing columns** with proper defaults
3. **Creates missing tables** (reports, tasks) if they don't exist
4. **Ensures proper foreign key relationships**
5. **Maintains existing data** while fixing schema issues

## After the Fix
- The application should start without database errors
- All existing data will be preserved
- New features (reports, tasks) will work properly
- The database will be compatible with the current entity structure

## Verification
After running the fix, you should see:
- No more datetime-related errors
- All required tables exist
- Spring Boot application starts successfully
- Reports functionality works in the frontend

## Troubleshooting
If you still get errors:
1. **Check the SQL execution** - ensure all commands ran successfully
2. **Verify table structure** - use `DESCRIBE table_name` in phpMyAdmin
3. **Check for foreign key constraints** - ensure referenced tables exist
4. **Restart the application** after the database changes

## Notes
- This fix preserves all existing data
- The `spring.jpa.hibernate.ddl-auto=update` setting is maintained
- No data loss occurs during the fix
- The fix is safe to run multiple times
