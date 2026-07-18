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

echo Running simulation test (5 cycles)...
set BOT_TEST_CYCLES=5
%PY% bot.py
echo.
pause
