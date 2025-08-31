@echo off
echo ========================================
echo    GSRV System - Quick Fix Script
echo ========================================
echo.

echo Step 1: Killing any existing Java processes...
taskkill /F /IM java.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Starting Backend...
cd backend
start "GSRV Backend" cmd /k "mvn spring-boot:run"
timeout /t 5 /nobreak >nul

echo Step 3: Starting Frontend...
cd ..\frontend\gsrv-frontend
start "GSRV Frontend" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    System Starting...
echo ========================================
echo.
echo Backend: http://localhost:8082
echo Frontend: http://localhost:4200
echo.
echo Please wait 30-60 seconds for both services to start
echo Then refresh your browser at http://localhost:4200
echo.
echo Press any key to exit...
pause >nul
