@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================
echo  MT5 Trading Bot - Windows Setup
echo ============================================
echo.

where py >nul 2>&1
if %errorlevel%==0 (
  set PY=py -3
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    set PY=python
  ) else (
    echo ERROR: Python not found. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
  )
)

echo Using: %PY%
%PY% --version
echo.

if not exist ".env" (
  if exist "bot.env.example" (
    copy /Y bot.env.example .env >nul
    echo Created .env from bot.env.example
    echo.
    echo IMPORTANT: Edit .env and add your keys:
    echo   - BASE44_API_KEY
    echo   - DISCORD_WEBHOOK_URL
    echo   - TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
    echo.
    notepad .env
  ) else (
    echo ERROR: bot.env.example not found.
    pause
    exit /b 1
  )
)

echo Installing dependencies...
%PY% -m pip install --upgrade pip
%PY% -m pip install -r requirements.txt
if %errorlevel% neq 0 (
  echo ERROR: pip install failed.
  pause
  exit /b 1
)

echo.
echo Setup complete.
echo.
echo IMPORTANT: Run check_config.bat to verify your .env file.
echo.
echo Next steps:
echo   check_config.bat          - verify folder + .env credentials
echo   test_notifications.bat    - test Discord + Telegram
echo   run_bot.bat               - run bot continuously
echo.
pause
