@echo off
echo.
echo ===========================================
echo   MONITOR DE ESTABILIDAD APOLLOCONSCIOUS
echo   Directiva V156 - Fase 2A Validacion
echo ===========================================
echo.
echo Iniciando monitoreo de 24h para validar
echo estabilidad de ApolloConscious bajo ResourceManager
echo.
echo Presiona Ctrl+C para detener el monitoreo
echo.
node stability_monitor_v156.js
pause