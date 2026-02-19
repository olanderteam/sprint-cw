@echo off
echo ========================================
echo  Sprint Compass - Desenvolvimento
echo ========================================
echo.
echo Iniciando servidores...
echo.
echo [1/2] Iniciando servidor proxy (porta 3001)...
start "Proxy Server" cmd /k "cd proxy-server && npm start"
timeout /t 3 /nobreak > nul
echo.
echo [2/2] Iniciando frontend (porta 8080)...
start "Frontend" cmd /k "npm run dev"
echo.
echo ========================================
echo  Servidores iniciados!
echo ========================================
echo.
echo Frontend: http://localhost:8080
echo Proxy:    http://localhost:3001
echo.
echo Pressione qualquer tecla para fechar este terminal...
pause > nul
