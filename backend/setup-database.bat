@echo off
echo Setting up onssa database...
echo.

REM Try to find MySQL in common locations
set MYSQL_PATH=

REM Check if MySQL is in PATH
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    set MYSQL_PATH=mysql
    goto :run_sql
)

REM Check common MySQL installation paths
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    goto :run_sql
)

if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    goto :run_sql
)

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
    goto :run_sql
)

echo MySQL client not found in PATH or common locations.
echo Please make sure MySQL is installed and mysql.exe is accessible.
echo.
echo You can also run the SQL script manually in phpMyAdmin or MySQL Workbench.
echo The script is located at: database-onssa.sql
pause
exit /b 1

:run_sql
echo Found MySQL at: %MYSQL_PATH%
echo.
echo Running database setup script...
echo.

%MYSQL_PATH% -u root -proot < database-onssa.sql

if %errorlevel% equ 0 (
    echo.
    echo Database setup completed successfully!
    echo Database 'onssa' has been created with all tables and sample data.
    echo.
    echo Default admin user:
    echo Username: admin
    echo Password: admin123
    echo.
) else (
    echo.
    echo Database setup failed with error code: %errorlevel%
    echo Please check your MySQL connection and try again.
    echo.
)

pause
