@echo off
echo Starting GSRV Backend...
echo.

cd backend

echo Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application...
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

pause
