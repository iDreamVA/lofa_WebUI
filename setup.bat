@echo off
cd /d "%~dp0"
echo Installing dependencies...
pnpm install
echo.
echo Installation complete! 
echo.
echo To start the development server, run:
echo   pnpm dev
echo.
pause
