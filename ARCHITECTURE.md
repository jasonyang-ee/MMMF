# Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Budget Forecast App                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   User Browser   │ ◄─────► │   Vite Server    │ ◄─────► │  Express Server  │
│   (React App)    │         │   (Dev Proxy)    │         │   (API Backend)  │
│   Port: 5173     │         │   Port: 5173     │         │   Port: 3000     │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                                                     │
                                                                     ▼
                                                            ┌──────────────────┐
                                                            │  File Database   │
                                                            │  (JSON Files)    │
                                                            │  ./data/         │
                                                            └──────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App.jsx (Main)                              │
│  - State Management                                                      │
│  - API Integration                                                       │
│  - DnD Context Provider                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│    Header     │         │BalanceDisplay │         │ForecastSettings│
│  - Branding   │         │ - Starting $  │         │ - Date Range  │
│  - Logo       │         │ - Current $   │         │ - Clear Btn   │
└───────────────┘         │ - Net Change  │         └───────────────┘
                          └───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│TransactionForm│         │TransactionList│         │ RecurringList │
│ - Add New     │         │ - Display All │         │ - Templates   │
│ - Date Picker │         │ - Delete      │         │ - Drag & Drop │
│ - Type Select │         │ - Sort by Date│         │ - Quick Add   │
└───────────────┘         └───────────────┘         └───────────────┘
                                    │
                                    ▼
                          ┌───────────────┐
                          │BalanceTimeline│
                          │ - Chart View  │
                          │ - Data Points │
                          │ - Hover Info  │
                          └───────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Components                            │
│  - Handle Events                                                 │
│  - Update Local State                                            │
│  - Call API Functions                                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Client (api.js)                         │
│  - Format Requests                                               │
│  - Handle Responses                                              │
│  - Error Handling                                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Server                             │
│  - Route Handling                                                │
│  - Request Validation                                            │
│  - Business Logic                                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    File Operations                               │
│  - Read JSON Files                                               │
│  - Parse Data                                                    │
│  - Update Records                                                │
│  - Write JSON Files                                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JSON Database Files                           │
│  - transactions.json                                             │
│  - recurring.json                                                │
│  - settings.json                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Balance Calculation Flow

```
Step 1: Load Starting Balance
    │
    ├─► Starting Balance: $5,000
    │
Step 2: Load All Transactions
    │
    ├─► Transaction 1: Rent -$1,500 (Oct 1)
    ├─► Transaction 2: Salary +$4,000 (Oct 15)
    ├─► Transaction 3: Utilities -$200 (Oct 5)
    │
Step 3: Sort by Date
    │
    ├─► Oct 1: Rent -$1,500
    ├─► Oct 5: Utilities -$200
    ├─► Oct 15: Salary +$4,000
    │
Step 4: Calculate Progressive Balance
    │
    ├─► Start:   $5,000
    ├─► Oct 1:   $5,000 - $1,500 = $3,500
    ├─► Oct 5:   $3,500 - $200 = $3,300
    ├─► Oct 15:  $3,300 + $4,000 = $7,300
    │
Step 5: Display Results
    │
    ├─► Forecasted Balance: $7,300
    ├─► Net Change: +$2,300
    └─► Timeline Chart: Visual representation
```

## API Route Structure

```
/api
├── /transactions
│   ├── GET     /          → List all transactions
│   ├── POST    /          → Create new transaction
│   ├── PUT     /:id       → Update transaction
│   ├── DELETE  /:id       → Delete transaction
│   └── DELETE  /          → Clear all transactions
│
├── /recurring
│   ├── GET     /          → List all recurring
│   ├── POST    /          → Create new recurring
│   ├── PUT     /:id       → Update recurring
│   └── DELETE  /:id       → Delete recurring
│
└── /settings
    ├── GET     /          → Get settings
    └── PUT     /          → Update settings
```

## File Database Structure

```
data/
│
├── transactions.json
│   └── [
│         {
│           "id": "1696419600000",
│           "name": "Monthly Rent",
│           "amount": 1500,
│           "type": "debit",
│           "date": "2025-10-01",
│           "createdAt": "2025-10-04T10:00:00.000Z"
│         },
│         ...
│       ]
│
├── recurring.json
│   └── [
│         {
│           "id": "1696419600001",
│           "name": "Electric Bill",
│           "amount": 150,
│           "type": "debit",
│           "createdAt": "2025-10-04T10:00:00.000Z"
│         },
│         ...
│       ]
│
└── settings.json
    └── {
          "startingBalance": 5000
        }
```

## Docker Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Docker Container                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Node.js 20 (Debian Bookworm)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Application Files (/app)                    │  │
│  │  - Built React App (dist/)                           │  │
│  │  - Express Server (server/)                          │  │
│  │  - Node Modules                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Volume Mount Point (/app/data)              │  │
│  │  - Persists between restarts                         │  │
│  │  - Syncs with host ./data directory                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Port 3000 ◄──────────────────────────► Host Port 3000     │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Host System    │
              │   ./data/        │
              │   - Backup       │
              │   - Version Ctrl │
              └──────────────────┘
```

## State Management

```
App Component State
│
├── startingBalance (number)
│   └── Loaded from API on mount
│
├── transactions (array)
│   ├── Loaded from API on mount
│   ├── Updated on add/delete
│   └── Passed to child components
│
├── recurring (array)
│   ├── Loaded from API on mount
│   ├── Updated on add/delete
│   └── Used for quick transaction creation
│
├── forecastEndDate (string)
│   ├── Default: 30 days from today
│   ├── Used to filter calculations
│   └── Updated by user input
│
└── loading (boolean)
    ├── True during initial data load
    └── False when ready
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  - React Components                         │
│  - Tailwind CSS                             │
│  - react-dnd (Drag & Drop)                  │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│           Application Layer                 │
│  - React Hooks (useState, useEffect)        │
│  - Event Handlers                           │
│  - Business Logic (utils.js)                │
│  - API Client (api.js)                      │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│              API Layer                      │
│  - Express.js Server                        │
│  - REST Endpoints                           │
│  - Request/Response Handling                │
│  - CORS Middleware                          │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│           Data Access Layer                 │
│  - File System Operations (fs)              │
│  - JSON Parsing                             │
│  - Data Validation                          │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│           Storage Layer                     │
│  - JSON Files                               │
│  - File System                              │
│  - Volume Mounts (Docker)                   │
└─────────────────────────────────────────────┘
```

## User Interaction Flow

```
1. User Opens App
   └─► Load Starting Balance, Transactions, Settings

2. User Sets Starting Balance
   └─► Update Local State → API Call → Update JSON → Recalculate

3. User Adds Transaction
   └─► Form Validation → API Call → Update JSON → Update State → Refresh UI

4. User Drags Recurring Item
   └─► DnD Event → Create Transaction → API Call → Update State

5. User Changes Forecast Date
   └─► Update State → Recalculate Balance → Update Chart

6. User Clicks Clear
   └─► Confirm → API Call → Clear Transactions → Keep Recurring → Refresh UI
```

## Build and Deployment Process

```
Development Mode
├─► npm run dev
│   ├─► Start Express Server (Port 3000)
│   ├─► Start Vite Dev Server (Port 5173)
│   └─► Proxy /api requests to Express

Production Build
├─► npm run build
│   ├─► Vite builds React app → dist/
│   └─► Express serves dist/ folder

Docker Deployment
├─► docker build
│   ├─► Use Node 20 Debian base image
│   ├─► Install dependencies
│   ├─► Build React app
│   └─► Set up Express server
└─► docker run
    ├─► Start Express server
    ├─► Serve built React app
    ├─► Mount data/ volume
    └─► Listen on port 3000
```
