#!/bin/bash

# =============================================================================
# MMMF Development Server Script
# =============================================================================
# Starts the development environment with proper process management.
# Handles graceful shutdown and reports startup failures.
# =============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}MMMF - Development Mode${NC}"
echo ""

# -----------------------------------------------------------------------------
# Pre-flight Checks
# -----------------------------------------------------------------------------

# Check if node is installed
if ! command -v node &>/dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed.${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

# Check node version (require 20+)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}ERROR: Node.js version $NODE_VERSION detected. Version 20+ is required.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &>/dev/null; then
    echo -e "${RED}ERROR: npm is not installed.${NC}"
    exit 1
fi

# Check if we're in the project root
if [ ! -f package.json ]; then
    echo -e "${RED}ERROR: This script must be run from the project root.${NC}"
    exit 1
fi

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "Creating data directory..."
    mkdir -p data
fi

# Build frontend
echo "Building frontend..."
npm run build

# -----------------------------------------------------------------------------
# Process Management
# -----------------------------------------------------------------------------

cleanup() {
    echo ""
    echo "Shutting down..."
    [ ! -z "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
    [ ! -z "$CLIENT_PID" ] && kill $CLIENT_PID 2>/dev/null || true
    echo "Stopped."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start backend server
node server/index.js &
SERVER_PID=$!
sleep 2
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Backend server failed to start${NC}"
    exit 1
fi
echo -e "${GREEN}OK${NC} Backend started (PID: $SERVER_PID)"

# Start frontend dev server
npx vite --config client/vite.config.js &
CLIENT_PID=$!
sleep 2
if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Frontend dev server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi
echo -e "${GREEN}OK${NC} Frontend started (PID: $CLIENT_PID)"

echo ""
echo -e "${GREEN}Servers running:${NC}"
echo "  API Server:  http://localhost:3600"
echo "  Frontend:    http://localhost:5173"
echo ""

# Wait for either process to exit
wait -n $SERVER_PID $CLIENT_PID

EXIT_CODE=$?
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Backend exited unexpectedly${NC}"
elif ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Frontend exited unexpectedly${NC}"
fi

cleanup
exit $EXIT_CODE
