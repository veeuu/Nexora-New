#!/bin/bash
# This script automates the startup process for the development environment on Ubuntu.

echo "Starting backend server in a new terminal..."
# Open a new terminal and start the backend
gnome-terminal -- bash -c "cd backend && npm start; exec bash"

echo "Starting frontend development server in a new terminal..."
# Open another terminal and start the frontend
gnome-terminal -- bash -c "cd nexora && npm run dev; exec bash"

echo "Waiting for the frontend server to start..."
sleep 5

echo "Opening frontend in browser..."
xdg-open http://localhost:5173
