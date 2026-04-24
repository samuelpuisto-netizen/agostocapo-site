@echo off
setlocal
cd /d "%~dp0"

set "PYTHON_EXE=%~dp0..\.venv\Scripts\python.exe"
set "PREVIEW_URL=http://127.0.0.1:8010/mobile-preview.html"

if not exist "%PYTHON_EXE%" (
  echo Could not find Python at:
  echo %PYTHON_EXE%
  echo.
  echo Opening the preview file directly instead.
  explorer.exe "%~dp0mobile-preview.html"
  pause
  exit /b 1
)

start "Agosto Capo Preview Server" "%PYTHON_EXE%" -m http.server 8010
timeout /t 2 /nobreak >nul
start "" "%PREVIEW_URL%"
