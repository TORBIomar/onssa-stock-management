@echo off
echo Starting GSRV System in Production Mode...
echo.

echo Starting Backend...
cd backend
start "GSRV Backend" cmd /k "mvn spring-boot:run"
cd ..

echo.
echo Starting Frontend (Production Build)...
cd frontend\gsrv-frontend\dist\gsrv-frontend\browser
start "GSRV Frontend" cmd /k "http-server -p 4200 -o"
cd ..\..\..\..

echo.
echo GSRV System is starting...
echo Backend: http://localhost:8082
echo Frontend: http://localhost:4200
echo.
echo Login credentials:
echo Username: admin
echo Password: admin123
echo.
echo Production mode is now active - no development servers running.
echo.
pause
