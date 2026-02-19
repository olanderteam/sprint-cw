@echo off
echo ========================================
echo Rebuilding Sprint Compass Proxy Server
echo ========================================
echo.
cd /d "%~dp0"
echo Compiling TypeScript...
node node_modules/typescript/lib/tsc.js
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Start the proxy server: npm start
    echo 2. Start the frontend: npm run dev (in root folder)
    echo 3. Access http://localhost:8080
    echo.
) else (
    echo.
    echo ========================================
    echo Build failed with error code %errorlevel%
    echo ========================================
    echo.
)
pause
