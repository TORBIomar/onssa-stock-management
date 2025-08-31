@echo off
echo Testing Database Connection...
echo.

echo Checking if MySQL is running...
netstat -an | findstr ":3306"
if %errorlevel% neq 0 (
    echo WARNING: MySQL might not be running on port 3306
    echo Please start MySQL/XAMPP/WAMP if not already running
    echo.
)

echo.
echo Testing connection to MySQL...
echo You may need to enter your MySQL password if configured

mysql -u root -h localhost -e "SHOW DATABASES;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL
    echo Please check:
    echo 1. MySQL is running
    echo 2. MySQL credentials in application.properties
    echo 3. Database 'onssa' exists
    echo.
) else (
    echo SUCCESS: MySQL connection works
    echo.
)

echo Checking if 'onssa' database exists...
mysql -u root -h localhost -e "USE onssa; SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Database 'onssa' might not exist
    echo You may need to create it or run the database setup scripts
    echo.
) else (
    echo SUCCESS: Database 'onssa' exists and is accessible
    echo.
)

pause
