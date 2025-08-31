@echo off
echo ========================================
echo GSRV System - Starting Optimized System
echo ========================================
echo.

echo [1/4] Installing Frontend Dependencies...
cd frontend\gsrv-frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

echo [2/4] Building Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b 1
)

echo [3/4] Starting Backend...
cd ..\..
cd backend
start "GSRV Backend" cmd /k "mvn spring-boot:run"

echo [4/4] Starting Frontend...
cd ..\frontend\gsrv-frontend
start "GSRV Frontend" cmd /k "npm start"

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:8081
echo Frontend: http://localhost:4200
echo.
echo Default Login:
echo Username: admin
echo Password: admin123
echo.
echo Press any key to exit...
pause > nul
