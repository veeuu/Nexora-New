#!/bin/bash
# This script automates the startup process for the development environment on Ubuntu.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/logs"

echo "Starting Nexora dev services..."

if command -v gnome-terminal >/dev/null 2>&1; then
  echo "Starting backend server in a new terminal..."
  gnome-terminal -- bash -c "cd \"$BACKEND_DIR\" && npm start; exec bash"

  echo "Starting frontend development server in a new terminal..."
  gnome-terminal -- bash -c "cd \"$FRONTEND_DIR\" && npm run dev:nexora; exec bash"

  echo "Waiting for the frontend server to start..."
  sleep 5

  if command -v xdg-open >/dev/null 2>&1; then
    echo "Opening frontend in browser..."
    xdg-open http://localhost:5173
  else
    echo "xdg-open not found. Open http://localhost:5173 manually."
  fi
else
  echo "No GUI detected. Running in the background with logs."
  mkdir -p "$LOG_DIR"

  echo "Starting backend..."
  nohup bash -c "cd \"$BACKEND_DIR\" && npm start" > "$LOG_DIR/backend-dev.log" 2>&1 &

  echo "Starting frontend..."
  nohup bash -c "cd \"$FRONTEND_DIR\" && npm run dev:nexora" > "$LOG_DIR/frontend-dev.log" 2>&1 &

  echo "Tail logs with:"
  echo "  tail -f \"$LOG_DIR/backend-dev.log\""
  echo "  tail -f \"$LOG_DIR/frontend-dev.log\""
fi
