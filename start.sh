#!/bin/bash

# =============================================================================
# MMMF Development Server Script
# =============================================================================
# This script ensures proper setup and starts the development environment.
# =============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}🚀 Starting MMMF Development Server...${NC}"
echo ""

# Check if node is installed
if ! command -v node &>/dev/null; then
    echo -e "${YELLOW}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

# Check node version (require 20+)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION detected. Version 20+ is recommended.${NC}"
fi

# Check if npm is installed
if ! command -v npm &>/dev/null; then
    echo -e "${YELLOW}Error: npm is not installed.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo -e "${BLUE}📁 Creating data directory...${NC}"
    mkdir -p data
fi

# Build the frontend first
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build

echo ""
echo -e "${GREEN}${BOLD}✨ Starting development servers...${NC}"
echo -e "   ${BLUE}API Server:${NC}      http://localhost:3600"
echo -e "   ${BLUE}Frontend Dev:${NC}    http://localhost:5173"
echo ""

# Start the development servers
npm run dev
