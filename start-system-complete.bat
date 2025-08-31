@echo off
echo ========================================
echo    GSRV System Startup Script
echo ========================================
echo.

echo Step 1: Checking prerequisites...
echo.

echo Checking Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or later
    pause
    exit /b 1
) else (
    echo ✓ Java is installed
)

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
)

echo Checking MySQL...
netstat -an | findstr ":3306" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL might not be running on port 3306
    echo Please start MySQL/XAMPP/WAMP if not already running
    echo.
) else (
    echo ✓ MySQL is running
)

echo.
echo Step 2: Starting Backend...
echo.

cd backend

echo Starting Spring Boot application...
echo This may take a few moments...
echo.

start "GSRV Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 3: Testing Backend...
echo.

curl -s http://localhost:8082/actuator/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend might not be ready yet
    echo Please wait a few more seconds and try again
    echo.
) else (
    echo ✓ Backend is running on http://localhost:8082
)

echo.
echo Step 4: Starting Frontend...
echo.

cd ..\frontend\gsrv-frontend

echo Starting Angular development server...
echo This may take a few moments...
echo.

start "GSRV Frontend" cmd /k "npm start"

echo.
echo Step 5: System Status...
echo.

echo Waiting for frontend to start...
timeout /t 20 /nobreak >nul

echo.
echo ========================================
echo    System Startup Complete
echo ========================================
echo.
echo Backend:  http://localhost:8082
echo Frontend: http://localhost:4200
echo.
echo If you see "chargement en cours" issues:
echo 1. Make sure both backend and frontend are running
echo 2. Check the browser console for errors (F12)
echo 3. Verify database connection
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:4200

echo.
echo System is ready! You can now use the application.
pause
