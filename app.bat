@echo off
REM This script automates the startup process for the development environment.

echo "Starting backend server in a new window..."
REM Navigate to the backend folder and start the server in a new command prompt window
start "Backend" cmd /k "cd backend && npm start"

echo "Starting frontend development server in a new window..."
REM Navigate to the frontend nexora folder and start the dev server in a new window
start "Frontend" cmd /k "cd nexora && npm run dev"

echo "Opening frontend in browser..."
REM Wait a few seconds for the dev server to be ready, then open the URL
timeout /t 5 /nobreak > nul
start http://localhost:5173