# Budget Forecast App

A comprehensive web-based budget forecasting application that helps you track and predict your account balance based on expected future transactions using credit and debit accounting principles.

## Features

- 📊 **Balance Forecasting**: Visualize your account balance over time
- 💰 **Starting Balance**: Set and adjust your initial account balance
- 📅 **Date-Based Transactions**: Add income and expenses with specific dates
- 🔄 **Recurring Transactions**: Store frequently used transactions for quick access
- 🎯 **Drag & Drop**: Drag recurring transactions to add them quickly
- 📈 **Visual Timeline**: Interactive chart showing balance progression
- 💾 **Persistent Storage**: All data stored in file-based database
- 🧹 **Clear Calculations**: Remove all transactions while keeping recurring ones
- 🎨 **Modern UI**: Built with Tailwind CSS for a beautiful, responsive design

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Express.js (Node.js)
- **Styling**: Tailwind CSS
- **Drag & Drop**: react-dnd
- **Date Handling**: date-fns
- **Database**: File-based JSON storage
- **Deployment**: Docker (Debian-based)

## Project Structure

```
BalanceForcast/
├── server/
│   └── index.js              # Express server with API routes
├── src/
│   ├── components/
│   │   ├── Header.jsx        # App header
│   │   ├── BalanceDisplay.jsx       # Starting and current balance display
│   │   ├── TransactionForm.jsx      # Form to add new transactions
│   │   ├── TransactionList.jsx      # List of all transactions
│   │   ├── RecurringList.jsx        # Recurring transactions management
│   │   ├── ForecastSettings.jsx     # Date range and clear settings
│   │   └── BalanceTimeline.jsx      # Visual timeline chart
│   ├── App.jsx               # Main application component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind styles
│   ├── api.js               # API utility functions
│   └── utils.js             # Helper functions
├── data/                    # File-based database storage
│   ├── transactions.json    # Active transactions
│   ├── recurring.json       # Recurring transactions
│   └── settings.json        # App settings (starting balance)
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── tailwind.config.js      # Tailwind configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)

### Installation

1. **Clone the repository** (or you're already here!)

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   This will start:

   - Backend API server on `http://localhost:3000`
   - Frontend dev server on `http://localhost:5173`

4. **Open your browser** and navigate to `http://localhost:5173`

### Development Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Docker Deployment

### Build Docker Image

```bash
npm run docker:build
```

Or manually:

```bash
docker build -t balance-forecast .
```

### Run Docker Container

```bash
npm run docker:run
```

Or manually with volume binding:

```bash
docker run -p 3000:3000 -v ./data:/app/data balance-forecast
```

The application will be available at `http://localhost:3000`

### Docker Volume Binding

The Docker container is configured to bind the `/app/data` directory to your local `./data` directory. This ensures:

- Data persists between container restarts
- You can backup your data easily
- Multiple containers can share the same data

## How It Works

### Accounting Principles

The app uses basic accounting principles:

- **Debit (Payment)**: Subtracts from your balance (e.g., rent, bills)
- **Credit (Income)**: Adds to your balance (e.g., salary, refunds)

### Balance Calculation

1. Start with your **Starting Balance**
2. Add all **Credit** transactions (income)
3. Subtract all **Debit** transactions (payments)
4. Result = **Forecasted Balance**

### Workflow

1. **Set Starting Balance**: Enter your current account balance
2. **Set Forecast Date**: Choose how far into the future you want to forecast
3. **Add Transactions**:
   - Enter one-time payments or income with specific dates
   - Or create recurring transactions for common expenses
4. **View Forecast**: See your balance timeline and projected balance
5. **Adjust**: Add, remove, or modify transactions as needed
6. **Clear When Done**: Clear all calculations while keeping recurring transactions

## API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `DELETE /api/transactions` - Clear all transactions

### Recurring Transactions

- `GET /api/recurring` - Get all recurring transactions
- `POST /api/recurring` - Add a new recurring transaction
- `PUT /api/recurring/:id` - Update a recurring transaction
- `DELETE /api/recurring/:id` - Delete a recurring transaction

### Settings

- `GET /api/settings` - Get app settings (starting balance)
- `PUT /api/settings` - Update app settings

## Data Storage

All data is stored in JSON files in the `data/` directory:

- **transactions.json**: Array of transaction objects
- **recurring.json**: Array of recurring transaction templates
- **settings.json**: App configuration (starting balance)

### Transaction Object Structure

```json
{
  "id": "1234567890",
  "name": "Monthly Rent",
  "amount": 1500.0,
  "type": "debit",
  "date": "2025-10-15",
  "createdAt": "2025-10-04T12:00:00.000Z"
}
```

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      },
    },
  },
}
```

### Adding New Features

The modular component structure makes it easy to add new features:

1. Create a new component in `src/components/`
2. Add API endpoints in `server/index.js`
3. Update the API utility in `src/api.js`
4. Import and use in `App.jsx`

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

- Change the port in `server/index.js` (line 10)
- Change the Vite port in `vite.config.js`

### Data Not Persisting

- Ensure the `data/` directory exists
- Check file permissions
- In Docker, verify volume binding is correct

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on the repository.

---

**Happy Forecasting! 📊💰**
