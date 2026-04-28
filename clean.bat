@echo off
chcp 65001 >nul

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===============================================
echo   Project Cleanup
echo ===============================================
echo.

echo [1] Killing node processes on ports 1658/1659...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":1658.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1 && echo   Killed PID %%a (port 1658)
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":1659.*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1 && echo   Killed PID %%a (port 1659)
)
echo   Done.

echo.
echo [2] Cleaning temp files...
if exist "server\temp\" (
    rmdir /s /q "server\temp" 2>nul
    echo   server/temp deleted
) else (
    echo   server/temp not found
)

echo.
echo [3] Cleaning build output...
if exist "project\dist\" (
    rmdir /s /q "project\dist" 2>nul
    echo   project/dist deleted
) else (
    echo   project/dist not found
)

echo.
echo ===============================================
echo   Cleanup complete.
echo   Run start.bat to restart services.
echo ===============================================
echo.
pause
