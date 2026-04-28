@echo off
chcp 65001 >nul

set "ROOT=%~dp0.."
for %%i in ("%ROOT%") do set "ROOT=%%~fi"

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
if exist "%ROOT%\server\temp\" (
    rmdir /s /q "%ROOT%\server\temp" 2>nul
    echo   server/temp deleted
) else (
    echo   server/temp not found
)

echo.
echo [3] Cleaning build output...
if exist "%ROOT%\project\dist\" (
    rmdir /s /q "%ROOT%\project\dist" 2>nul
    echo   project/dist deleted
) else (
    echo   project/dist not found
)

echo.
echo ===============================================
echo   Cleanup complete.
echo   Run scripts\start.bat to restart services.
echo ===============================================
echo.
pause
