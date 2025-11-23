#!/bin/bash
echo "🚀 Starting Budget Forecast App..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install > /dev/null 2>&1
fi

if [ ! -d "data" ]; then
    mkdir -p data
fi

echo "✨ Servers: API http://localhost:3600 | Frontend http://localhost:5173"
npm run dev
