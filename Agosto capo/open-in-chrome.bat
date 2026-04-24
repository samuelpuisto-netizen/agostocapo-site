@echo off
setlocal
cd /d "%~dp0"

set "SITE_FILE=%~dp0index.html"
set "CHROME_EXE="

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined CHROME_EXE (
  echo Google Chrome was not found.
  echo Opening the site with Explorer instead.
  explorer.exe "%SITE_FILE%"
  pause
  exit /b 1
)

start "" "%CHROME_EXE%" "%SITE_FILE%"
