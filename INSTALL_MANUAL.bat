@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================
echo  MT5 Trading Bot - Manual Install (no setup.bat needed)
echo ============================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (set PY=py -3) else (set PY=python)

echo Using: %PY%
%PY% --version
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Python not found.
  echo Download from https://www.python.org/downloads/
  echo Check "Add Python to PATH" during install.
  pause
  exit /b 1
)

if not exist "bot.py" (
  echo.
  echo ERROR: bot.py not found in this folder.
  echo.
  echo Your folder is outdated. Get the latest code:
  echo.
  echo   cd C:\Users\elmep\Downloads
  echo   git clone -b cursor/python-bot-script-9399 https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io.git MT5_Trading_Bot
  echo   cd MT5_Trading_Bot
  echo   setup.bat
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist "bot.env.example" (
    copy /Y bot.env.example .env >nul
    echo Created .env - opening Notepad to add your API keys...
    notepad .env
  )
)

echo Installing packages...
%PY% -m pip install --upgrade pip
%PY% -m pip install -r requirements.txt

echo.
echo Done! Next run:
echo   test_notifications.bat
echo   run_dashboard_test.bat
echo   run_bot.bat
echo.
pause
