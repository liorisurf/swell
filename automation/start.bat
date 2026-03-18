@echo off
title SWELL Instagram Automation Bot
color 0A

echo ============================================
echo   SWELL Instagram Automation Bot
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

:: Check if .env exists
if not exist "%~dp0.env" (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and fill in your credentials.
    echo.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

:: Install dependencies if needed
if not exist "%~dp0node_modules\playwright" (
    echo [INFO] Installing dependencies...
    echo.
    cd /d "%~dp0"
    call npm install playwright dotenv
    echo.
    echo [INFO] Installing Chromium browser...
    call npx playwright install chromium
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

:: Run the bot
echo [INFO] Starting the bot...
echo [INFO] Press Ctrl+C to stop at any time.
echo.
cd /d "%~dp0"
node bot.mjs

echo.
echo Bot stopped.
pause
