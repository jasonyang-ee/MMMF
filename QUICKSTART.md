# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies (Already Done!)

```bash
npm install
```

✅ Dependencies are already installed!

### 2. Start the Application

**Option A: Using the start script (Recommended)**

```bash
# On Windows
start.bat

# On Mac/Linux
chmod +x start.sh
./start.sh
```

**Option B: Using npm directly**

```bash
npm run dev
```

This will start both servers:

- 🔧 Backend API: http://localhost:3000
- 🎨 Frontend: http://localhost:5173

### 3. Open in Browser

Navigate to **http://localhost:5173** and start forecasting!

---

## 🐳 Docker Deployment

### Quick Docker Start

```bash
# Build and run in one command
docker-compose up --build
```

Access the app at **http://localhost:3000**

### Manual Docker Commands

```bash
# Build the image
docker build -t balance-forecast .

# Run the container with volume binding
docker run -p 3000:3000 -v ./data:/app/data balance-forecast
```

---

## 📖 First Time Using the App?

### Step-by-Step Tutorial

1. **Set Your Starting Balance**

   - Click "Edit" next to the starting balance
   - Enter your current account balance
   - Click "Save"

2. **Add Your First Transaction**

   - Fill in the description (e.g., "Rent Payment")
   - Enter the amount
   - Choose type: Debit (payment) or Credit (income)
   - Select the date
   - Click "Add Transaction"

3. **Create Recurring Transactions** (Optional)

   - Click "+ Add New" in the Recurring Transactions section
   - Enter common expenses like rent, utilities, salary
   - Save them for quick reuse

4. **View Your Forecast**

   - The balance timeline shows your projected balance
   - The forecasted balance updates automatically
   - Hover over chart points for details

5. **Adjust Forecast Range**
   - Change the "Forecast Until" date in settings
   - Default is 30 days from today

---

## 🔧 Troubleshooting

### Port Already in Use?

**Change Backend Port** (server/index.js):

```javascript
const PORT = process.env.PORT || 3001; // Change 3000 to 3001
```

**Change Frontend Port** (vite.config.js):

```javascript
server: {
  port: 5174, // Change 5173 to 5174
}
```

### Can't See Your Data?

Check that the `data/` directory exists and has these files:

- transactions.json
- recurring.json
- settings.json

These are created automatically on first run.

### Build Errors?

Try a fresh install:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Pro Tips

1. **Drag & Drop**: Drag recurring transactions to quickly add them
2. **Keyboard Friendly**: Use Tab to navigate through forms
3. **Clear Regularly**: Use "Clear All Transactions" to start fresh planning
4. **Backup Data**: The `data/` folder contains all your information
5. **Mobile Friendly**: Works great on phones and tablets

---

## 📊 Example Usage

### Scenario: Monthly Budget Planning

1. Set starting balance: $5,000
2. Add recurring expenses:
   - Rent: $1,500 (debit)
   - Utilities: $200 (debit)
   - Groceries: $500 (debit)
3. Add expected income:
   - Salary: $4,000 (credit) on the 15th
4. Add one-time payments:
   - Car insurance: $600 (debit) on the 20th
5. Set forecast to end of month
6. See your projected balance!

---

## 📚 Need More Help?

- Read the full [README.md](README.md)
- Check the API documentation in README
- Examine the code - it's well-commented!

---

**Happy Forecasting! 💰📈**
