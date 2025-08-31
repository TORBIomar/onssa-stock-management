@echo off
echo Testing Frontend-Backend Connection...
echo.

echo Testing Backend Health Endpoint...
curl -s http://localhost:8082/health
if %errorlevel% neq 0 (
    echo ERROR: Backend health endpoint not responding
) else (
    echo ✓ Backend health endpoint is working
)

echo.
echo Testing Backend Actuator Health...
curl -s http://localhost:8082/actuator/health
if %errorlevel% neq 0 (
    echo ERROR: Backend actuator health not responding
) else (
    echo ✓ Backend actuator health is working
)

echo.
echo Testing Frontend Connection...
curl -s http://localhost:4200
if %errorlevel% neq 0 (
    echo ERROR: Frontend not responding
) else (
    echo ✓ Frontend is responding
)

echo.
echo ========================================
echo Connection Test Complete
echo ========================================
echo.
echo If all tests passed, try refreshing your browser
echo and the "chargement en cours" should disappear!
echo.
pause
