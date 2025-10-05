#!/bin/bash

echo "🚀 Starting Budget Forecast App..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
    echo ""
fi

# Start the application
echo "✨ Starting development servers..."
echo "   - Backend API: http://localhost:3000"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
