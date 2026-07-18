@echo off
setlocal EnableExtensions

echo ============================================
echo  GET LATEST BOT (fixes missing setup.bat)
echo ============================================
echo.

set TARGET=C:\Users\elmep\Downloads\MT5_Trading_Bot
set REPO=https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io.git
set BRANCH=cursor/python-bot-script-9399

cd /d C:\Users\elmep\Downloads

if exist "%TARGET%\.env" (
  echo Backing up your .env file...
  copy /Y "%TARGET%\.env" "%TEMP%\mt5_bot_env_backup.env" >nul
)

if exist "%TARGET%" (
  echo Removing old folder...
  rmdir /S /Q "%TARGET%"
)

echo Downloading latest bot (multi-symbol strategy)...
git clone -b %BRANCH% %REPO% MT5_Trading_Bot
if %errorlevel% neq 0 (
  echo.
  echo ERROR: git clone failed. Install Git from https://git-scm.com/download/win
  echo.
  echo OR download ZIP manually:
  echo https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io/archive/refs/heads/cursor/python-bot-script-9399.zip
  pause
  exit /b 1
)

cd /d "%TARGET%"

if exist "%TEMP%\mt5_bot_env_backup.env" (
  copy /Y "%TEMP%\mt5_bot_env_backup.env" ".env" >nul
  echo Restored your .env file.
)

echo.
echo Running setup...
call setup.bat
