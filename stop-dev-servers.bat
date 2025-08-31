@echo off
echo Stopping Development Servers...
echo.

echo Stopping Angular Development Server...
taskkill /F /IM node.exe 2>nul
echo Angular dev server stopped.

echo.
echo Stopping Java Development Servers...
taskkill /F /IM java.exe 2>nul
echo Java servers stopped.

echo.
echo Development servers stopped.
echo Production servers should still be running.
echo.
pause
