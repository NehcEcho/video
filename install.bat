@echo off
chcp 65001 >nul

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===============================================
echo    Bilibili Subtitle Extract + AI Summary
echo    Environment Installer
echo ===============================================
echo.

echo [1/4] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [X] Node.js not found
    echo   Please install: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node -v') do echo   [OK] Node.js %%a

echo.
echo [2/4] Installing npm dependencies...

echo   project/ ...
cd /d "%ROOT%\project"
if not exist "node_modules\" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo   [X] Install failed
    ) else (
        echo   [OK] Done
    )
) else (
    echo   [OK] Already installed
)

echo   server/ ...
cd /d "%ROOT%\server"
if not exist "node_modules\" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo   [X] Install failed
    ) else (
        echo   [OK] Done
    )
) else (
    echo   [OK] Already installed
)
cd /d "%ROOT%"

echo.
echo [3/4] Checking yt-dlp...
where yt-dlp >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%a in ('yt-dlp --version') do echo   [OK] yt-dlp v%%a
) else (
    echo   Installing via pip...
    pip install yt-dlp >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   [OK] yt-dlp installed
    ) else (
        winget install yt-dlp.yt-dlp --accept-source-agreements --accept-package-agreements >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo   [OK] yt-dlp installed (winget)
        ) else (
            echo   [X] Failed, run: pip install yt-dlp
        )
    )
)

echo.
echo [4/4] Checking ffmpeg...
where ffmpeg >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] ffmpeg found
) else (
    echo   Installing via winget...
    winget install Gyan.FFmpeg --accept-source-agreements --accept-package-agreements >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   [OK] ffmpeg installed, restart terminal needed
    ) else (
        echo   [X] Failed, download from https://ffmpeg.org
    )
)

echo.
echo ===============================================
echo   Setup complete!
echo.
echo   To start: double-click start.bat
echo   Or manually:
echo     terminal 1: cd server ^&^& npm run dev
echo     terminal 2: cd project ^&^& npm run dev
echo ===============================================
echo.
pause
