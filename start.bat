@echo off
echo Starting Budget Forecast App...

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install > nul 2>&1
)

if not exist "data\" (
    mkdir data
)

echo Servers: API http://localhost:3600 | Frontend http://localhost:5173
npm run dev
