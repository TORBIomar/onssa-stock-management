# Database Setup for GSRV System

## Overview
This document explains how to set up the `onssa` database for the GSRV backend system.

## Prerequisites
- MySQL Server running on product-reclamation-db.gsrv-system.com:3306
- MySQL user `root` with password `root`
- MySQL client tools accessible

## Quick Setup

### Option 1: Using the provided scripts (Recommended)

#### Windows Batch File
```cmd
setup-database.bat
```

#### PowerShell Script
```powershell
.\setup-database.ps1
```

### Option 2: Manual setup

1. **Connect to MySQL**
   ```bash
   mysql -u root -proot
   ```

2. **Run the SQL script**
   ```sql
   source database-onssa.sql;
   ```

### Option 3: Using phpMyAdmin or MySQL Workbench

1. Open phpMyAdmin or MySQL Workbench
2. Connect to your MySQL server
3. Copy and paste the contents of `database-onssa.sql`
4. Execute the script

## What the script creates

### Database
- **Name**: `onssa`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

### Tables
1. **roles** - User roles (ADMIN, AGENT, VETERINAIRE)
2. **users** - User accounts with authentication
3. **products** - Product inventory management
4. **reclamations** - Product complaints/reclamations

### Sample Data
- Default admin user (username: `admin`, password: `admin123`)
- Sample products in different categories
- Sample reclamations

## Default Login Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: ADMIN

## Troubleshooting

### Common Issues

1. **Access denied for user 'root'@'product-reclamation-db.gsrv-system.com'**
   - Check if MySQL is running
   - Verify the password is correct
   - Try resetting MySQL root password if needed

2. **MySQL client not found**
   - Install MySQL client tools
   - Add MySQL bin directory to PATH
   - Use the full path to mysql.exe

3. **Connection refused**
   - Ensure MySQL service is running
   - Check if port 3306 is open
   - Verify firewall settings

### Manual Database Creation
If the script fails, you can create the database manually:

```sql
CREATE DATABASE onssa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE onssa;
-- Then copy and paste the table creation statements from database-onssa.sql
```

## After Setup
Once the database is set up:

1. **Start the backend**:
   ```bash
   mvn spring-boot:run
   ```

2. **Test the connection**:
   - Backend should start without database errors
   - Check logs for successful database connection
   - Test the health endpoint: `https://product-reclamation-hub-api.gsrv-system.com/health`

3. **Test product creation**:
   - The "ajouter produit" button should now work
   - Products should be saved to the database
   - Check the products table for new entries

## Support
If you encounter issues:
1. Check the MySQL error logs
2. Verify MySQL service is running
3. Test MySQL connection manually
4. Check the backend application logs
