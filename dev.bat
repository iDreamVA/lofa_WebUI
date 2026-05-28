@echo off
cd /d "%~dp0"
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Installation failed!
    pause
    exit /b 1
)
echo.
echo Starting development server...
echo.
npm run dev
pause
