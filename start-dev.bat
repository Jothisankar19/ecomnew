@echo off
echo Starting Ethnic Elegance Development Servers...
echo.

:: Start Backend
echo [1/2] Starting Backend on port 5000...
start "Backend" cmd /k "cd /d d:\website\ecommerce\backend && npm run dev"

timeout /t 2 /nobreak > nul

:: Start Frontend (Vite)
echo [2/2] Starting Frontend (Vite) on port 3000...
start "Frontend" cmd /k "cd /d d:\website\ecommerce\frontend && npm run dev"

echo.
echo Servers starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
