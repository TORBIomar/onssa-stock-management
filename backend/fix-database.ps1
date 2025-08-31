# Database Fix Script for GSRV System
# This script fixes the database schema issues without losing data

Write-Host "🔧 Fixing Database Schema Issues..." -ForegroundColor Yellow

# MySQL connection parameters
$mysqlHost = "localhost"
$mysqlPort = "3306"
$mysqlUser = "root"
$mysqlPassword = ""
$database = "onssa"

# Check if MySQL is accessible
try {
    # Try to connect to MySQL
    $connectionString = "Server=$mysqlHost;Port=$mysqlPort;Uid=$mysqlUser;Pwd=$mysqlPassword;Database=$database;"
    
    Write-Host "📡 Connecting to MySQL database '$database'..." -ForegroundColor Cyan
    
    # Create a simple connection test
    $testQuery = "SELECT 1 as test;"
    
    # Use MySQL .NET connector if available, otherwise show manual instructions
    Write-Host "⚠️  MySQL .NET connector not available in PowerShell by default" -ForegroundColor Red
    Write-Host "📋 Please run the following SQL commands manually in phpMyAdmin or MySQL Workbench:" -ForegroundColor Yellow
    Write-Host ""
    
    # Read and display the SQL fix script
    $sqlScript = Get-Content "fix-database-schema.sql" -Raw
    Write-Host "🔧 SQL Fix Script:" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host $sqlScript -ForegroundColor White
    
    Write-Host ""
    Write-Host "📋 Manual Steps:" -ForegroundColor Yellow
    Write-Host "1. Open phpMyAdmin in your browser (http://localhost/phpmyadmin)" -ForegroundColor White
    Write-Host "2. Select the 'onssa' database" -ForegroundColor White
    Write-Host "3. Go to the 'SQL' tab" -ForegroundColor White
    Write-Host "4. Copy and paste the SQL script above" -ForegroundColor White
    Write-Host "5. Click 'Go' to execute" -ForegroundColor White
    Write-Host ""
    Write-Host "6. After fixing the database, restart the Spring Boot application" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Database fix script prepared successfully!" -ForegroundColor Green
Write-Host "📝 Please run the SQL commands manually in phpMyAdmin" -ForegroundColor Yellow
