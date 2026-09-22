@echo off
title Subir Proyecto ENSUB a GitHub
color 0A
echo ========================================================
echo   SUBIENDO PROYECTO MAESTRO ENSUB A GITHUB (114 ARCHIVOS)
echo ========================================================
echo.
cd /d C:\ENSUB_DEPLOY
"%TEMP%\mingit\cmd\git.exe" push -u origin main --force
echo.
echo ========================================================
echo   PROCESO COMPLETADO
echo ========================================================
pause
