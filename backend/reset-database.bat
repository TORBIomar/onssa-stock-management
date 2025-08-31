@echo off
echo ========================================
echo    GSRV Database Reset Tool
echo ========================================
echo.

echo This tool will help you reset the database properly.
echo.

echo Step 1: Stop the Spring Boot application if it's running
echo Step 2: Open phpMyAdmin in your browser
echo Step 3: Run the SQL commands from fix-database-schema.sql
echo Step 4: Restart the Spring Boot application
echo.

echo SQL Commands to run in phpMyAdmin:
echo ========================================
echo.

type fix-database-schema.sql

echo.
echo ========================================
echo After running the SQL commands:
echo 1. Go back to this terminal
echo 2. Run: mvn spring-boot:run
echo 3. The application should start without errors
echo ========================================
echo.

pause
