#!/bin/bash
echo "🚀 Starting Budget Forecast App..."

echo "📦 Installing dependencies..."
npm install

if [ ! -d "data" ]; then
    mkdir -p data
fi

echo "✨ Servers: API http://localhost:3600 | Frontend http://localhost:5173"
npm run dev
