@echo off
chcp 65001 >nul

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===============================================
echo    Bilibili Subtitle Extract + AI Summary v1.0
echo ===============================================
echo.
echo   Starting backend  on port 1658...
echo   Starting frontend on port 1659...
echo.
echo   Open: http://localhost:1659
echo   Close the popup windows to stop all services
echo ===============================================
echo.

start "BiliBackend" cmd /k "cd /d "%ROOT%\server" && npm run dev"
start "BiliFrontend" cmd /k "cd /d "%ROOT%\project" && npm run dev"

ping -n 5 127.0.0.1 >nul
start "" http://localhost:1659

echo All services started. Press any key to exit this window.
pause >nul
