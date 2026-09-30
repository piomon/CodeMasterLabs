@echo off
setlocal
cd /d "%~dp0"
call npm run verify:functional
set "RESULT=%ERRORLEVEL%"
echo.
echo Report: reports\functional-local\acceptance.json
exit /b %RESULT%
