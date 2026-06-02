@echo off
echo Starting TenantSentry local server...
echo Open http://localhost:8080 in your browser
echo Press Ctrl+C to stop
cd /d "%~dp0"
python -m http.server 8080
pause
