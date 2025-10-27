@echo off
REM 👁️ VIGILIA FINAL V178 - PM2 LAUNCHER
REM Ejecuta vigilia de 24h independiente de VS Code
REM DIRECTIVA: Que Se Haga la Luz

echo ⚡ VIGILIA FINAL V178 - PM2 LAUNCHER
echo 🎯 DIRECTIVA: Que se Haga la Luz
echo 🛡️ Proceso independiente - NO muere con VS Code
echo.

REM Cambiar al directorio correcto
cd /d "C:\Users\Raulacate\Desktop\Proyectos programacion\Dentiagest\apollo-nuclear"

REM Verificar si PM2 está instalado
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 no detectado. Instalando...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ Error instalando PM2. Instálalo manualmente: npm install -g pm2
        pause
        exit /b 1
    )
)

echo ✅ PM2 detectado
echo.

REM Detener vigilia anterior si existe
echo 🧹 Limpiando vigilia anterior...
pm2 delete vigilia-final-v178 >nul 2>&1

REM Iniciar nueva vigilia con PM2
echo 🚀 Iniciando VIGILIA FINAL V178...
pm2 start vigilia_final_v178.js --name "vigilia-final-v178" --log-date-format "YYYY-MM-DD HH:mm:ss" --max-memory-restart 500M

if %errorlevel% eql 0 (
    echo.
    echo 🎉 VIGILIA FINAL V178 INICIADA EXITOSAMENTE
    echo 📊 Monitoreo: 24 horas continuas
    echo 🔍 Intervalo: Cada 5 minutos  
    echo 📄 Logs: PM2 + archivo JSON
    echo 🛡️ Independiente de VS Code
    echo.
    echo 📋 COMANDOS ÚTILES:
    echo    pm2 status               - Ver estado
    echo    pm2 logs vigilia-final-v178  - Ver logs en tiempo real
    echo    pm2 monit               - Monitor interactivo
    echo    pm2 stop vigilia-final-v178  - Parar vigilia
    echo    pm2 restart vigilia-final-v178 - Reiniciar
    echo    pm2 delete vigilia-final-v178  - Eliminar completamente
    echo.
    echo ⚡ VIGILIA ACTIVA - Puedes cerrar VS Code sin problemas
    
    REM Mostrar status inicial
    timeout /t 3 /nobreak >nul
    echo 📊 STATUS INICIAL:
    pm2 status
    
) else (
    echo ❌ Error iniciando vigilia con PM2
    echo 💡 Intenta ejecutar manualmente: node vigilia_final_v178.js
)

echo.
echo 🎯 DIRECTIVA V178 LAUNCHER COMPLETADO
pause