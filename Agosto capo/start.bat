@echo off
setlocal
cd /d "%~dp0"

set "PYTHON_EXE=%~dp0..\.venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
  echo Could not find Python at:
  echo %PYTHON_EXE%
  echo.
  echo Opening the website file directly instead.
  explorer.exe "%~dp0index.html"
  pause
  exit /b 1
)

start "" cmd /c "timeout /t 2 /nobreak >nul && start "" http://localhost:8000/index.html"
"%PYTHON_EXE%" -m http.server 8000
