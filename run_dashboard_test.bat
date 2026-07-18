@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (set PY=py -3) else (set PY=python)

if not exist ".env" (
  echo ERROR: .env not found. Run setup.bat first.
  pause
  exit /b 1
)

echo Pushing live test trades to Trade Sentinel dashboard...
%PY% scripts\test_dashboard_live.py
echo.
pause
