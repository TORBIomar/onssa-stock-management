# Complete Database Cleanup Script
# This will remove ALL data and start fresh

Write-Host "🧹 Complete Database Cleanup for GSRV System" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Red
Write-Host ""

Write-Host "⚠️  WARNING: This will DELETE ALL DATA in the 'onssa' database!" -ForegroundColor Yellow
Write-Host "⚠️  This action cannot be undone!" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 To clean the database completely:" -ForegroundColor Cyan
Write-Host "1. Stop the Spring Boot application if it's running" -ForegroundColor White
Write-Host "2. Open phpMyAdmin in your browser (http://localhost/phpmyadmin)" -ForegroundColor White
Write-Host "3. Select the onssa database" -ForegroundColor White
Write-Host "4. Go to the SQL tab" -ForegroundColor White
Write-Host "5. Copy and paste the following SQL commands:" -ForegroundColor White
Write-Host ""

Write-Host "🔧 SQL Commands to run:" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""

# Read and display the SQL script
$sqlScript = Get-Content "clean-database-completely.sql" -Raw
Write-Host $sqlScript -ForegroundColor White

Write-Host ""
Write-Host "📋 After running the SQL commands:" -ForegroundColor Cyan
Write-Host "1. Go back to this terminal" -ForegroundColor White
Write-Host "2. Run: mvn spring-boot:run" -ForegroundColor White
Write-Host "3. The application will create fresh tables and start without errors" -ForegroundColor White
Write-Host ""

Write-Host "✅ This will resolve the duplicate user creation issue!" -ForegroundColor Green
Write-Host ""

pause
