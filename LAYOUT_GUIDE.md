# New Layout Guide

## Page Structure Overview

```
╔═══════════════════════════════════════════════════════════════════════╗
║                            HEADER                                      ║
║                      Budget Forecast App                               ║
╚═══════════════════════════════════════════════════════════════════════╝

┌─────────────────────┬───────────────────────────────┬─────────────────────┐
│   LEFT SIDEBAR      │      CENTER CONTENT           │   RIGHT SIDEBAR     │
│     (3 cols)        │        (6 cols)               │      (3 cols)       │
├─────────────────────┼───────────────────────────────┼─────────────────────┤
│                     │                               │                     │
│ ┌─────────────────┐ │  ┌─────────────────────────┐  │ ┌─────────────────┐ │
│ │ ACCOUNT BALANCE │ │  │   BALANCE TIMELINE      │  │ │ ADD TRANSACTION │ │
│ │                 │ │  │   ═══════════════════   │  │ │                 │ │
│ │ Starting: $5000 │ │  │   Action | Date | Desc │  │ │ Description:    │ │
│ │ Current:  $7200 │ │  │   ───────┼──────┼───── │  │ │ [____________]  │ │
│ │ Change:  +$2200 │ │  │   [Del]  | 10/4 | Rent │  │ │                 │ │
│ │                 │ │  │         | 10/5 | Sal  │  │ │ Amount:         │ │
│ │ [Edit Balance]  │ │  │   [Del]  | 10/8 | Gas  │  │ [____________]  │ │
│ └─────────────────┘ │  │         | 10/15| Rent │  │ │                 │ │
│                     │  │         | 11/15| Rent │  │ │ ◉ Debit         │ │
│ ┌─────────────────┐ │  │   (Auto-generated from  │  │ │ ○ Credit        │ │
│ │ FORECAST        │ │  │    recurring items)     │  │ │                 │ │
│ │ SETTINGS        │ │  │                         │  │ │ Date:           │ │
│ │                 │ │  │   Showing balance after │  │ │ [2025-10-04]    │ │
│ │ Start: Today    │ │  │   each transaction      │  │ │                 │ │
│ │ [2025-10-04]    │ │  │                         │  │ │ [Add]           │ │
│ │                 │ │  └─────────────────────────┘  │ └─────────────────┘ │
│ │ End Date:       │ │                               │                     │
│ │ [2025-11-03]    │ │    CENTERED & PROMINENT      │ ┌─────────────────┐ │
│ │                 │ │                               │ │ RECURRING       │ │
│ │ (30 days)       │ │                               │ │ TRANSACTIONS    │ │
│ │                 │ │                               │ │                 │ │
│ │ [Clear All]     │ │                               │ │ [+ Add New]     │ │
│ └─────────────────┘ │                               │ │                 │ │
│                     │                               │ │ Rent            │ │
│                     │                               │ │ Day 1 • -$1500  │ │
│                     │                               │ │ [+] [Delete]    │ │
│                     │                               │ │                 │ │
│                     │                               │ │ Salary          │ │
│                     │                               │ │ Day 15 • +$4000 │ │
│                     │                               │ │ [+] [Delete]    │ │
│                     │                               │ │                 │ │
│                     │                               │ │ (Drag or click  │ │
│                     │                               │ │  + to add)      │ │
│                     │                               │ └─────────────────┘ │
└─────────────────────┴───────────────────────────────┴─────────────────────┘
```

## Balance Timeline Table Format

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         BALANCE TIMELINE                                  ║
╠════════╦════════════╦══════════════════╦═══════════════╦═══════════════════╣
║ Action ║    Date    ║   Description    ║    Amount     ║     Balance       ║
╠════════╬════════════╬══════════════════╬═══════════════╬═══════════════════╣
║        ║ Oct 04     ║ Starting Balance ║               ║  $5,000.00       ║
╠────────╬────────────╬──────────────────╬───────────────╬───────────────────╣
║  [🗑]  ║ Oct 05     ║ Groceries        ║  -$200.00    ║  $4,800.00       ║
╠────────╬────────────╬──────────────────╬───────────────╬───────────────────╣
║  Auto  ║ Oct 15     ║ Rent [Recurring] ║  -$1,500.00  ║  $3,300.00       ║
╠────────╬────────────╬──────────────────╬───────────────╬───────────────────╣
║  [🗑]  ║ Oct 20     ║ Freelance Income ║  +$800.00    ║  $4,100.00       ║
╠────────╬────────────╬──────────────────╬───────────────╬───────────────────╣
║  Auto  ║ Nov 15     ║ Rent [Recurring] ║  -$1,500.00  ║  $2,600.00       ║
╚════════╩════════════╩══════════════════╩═══════════════╩═══════════════════╝

Legend:
[🗑] = Delete button (only for manually added transactions)
Auto = Auto-generated from recurring (cannot delete)
[Recurring] = Badge showing it's auto-generated
```

## Component Positions

### Left Sidebar Components

```
Position 1 (TOP):
┌─────────────────────┐
│ ACCOUNT BALANCE     │
│ • Starting Balance  │
│ • Current Balance   │
│ • Net Change        │
│ • Edit Button       │
└─────────────────────┘

Position 2 (SECOND):
┌─────────────────────┐
│ FORECAST SETTINGS   │
│ • Current Date      │
│ • Forecast End Date │
│ • Days Count        │
│ • Clear Button      │
└─────────────────────┘
```

### Center Content

```
┌─────────────────────────────┐
│   BALANCE TIMELINE TABLE    │
│ ╔═══╦═════╦═══════╦═══╦═══╗ │
│ ║ ⚡ ║Date║ Desc  ║ $ ║Bal║ │
│ ╠═══╬═════╬═══════╬═══╬═══╣ │
│ ║[X]║10/4 ║ Start ║   ║$$$║ │
│ ║[X]║10/5 ║ Rent  ║-$ ║$$$║ │
│ ║ A ║10/15║ Rent  ║-$ ║$$$║ │
│ ╚═══╩═════╩═══════╩═══╩═══╝ │
│                             │
│  Centered, Table Format     │
│  Date & Balance Focus       │
└─────────────────────────────┘
```

### Right Sidebar Components

```
Position 1 (TOP):
┌─────────────────────┐
│ ADD TRANSACTION     │
│ • Description       │
│ • Amount            │
│ • Type (Debit/Cred) │
│ • Date Picker       │
│ • Add Button        │
└─────────────────────┘

Position 2 (SECOND):
┌─────────────────────┐
│ RECURRING TRANS.    │
│ • List of Templates │
│ • Day of Month      │
│ • Drag & Drop       │
│ • Quick Add (+)     │
│ • Delete Button     │
│ • Add New Form      │
└─────────────────────┘
```

## User Workflow

```
STEP 1: Setup (Left Sidebar)
   ↓
   Set Starting Balance
   Set Forecast End Date

STEP 2: Add Recurring (Right Sidebar - Bottom)
   ↓
   Create recurring items with day of month
   (e.g., Rent on day 1, Salary on day 15)

STEP 3: Add One-Time (Right Sidebar - Top)
   ↓
   Add manual transactions as needed

STEP 4: View Timeline (Center)
   ↓
   See all transactions with dates and balances
   Delete manual items if needed

STEP 5: Analyze (Center + Left)
   ↓
   Review balance timeline
   Check current forecasted balance
```

## Key Features Visualization

### Recurring Transaction Auto-Generation

```
Recurring Template:
┌──────────────────────┐
│ Rent                 │
│ Amount: $1,500       │
│ Type: Debit          │
│ Day of Month: 1      │  ←─── NEW FIELD!
└──────────────────────┘
           ↓
    Auto-Generates:
    ┌──────────────┐
    │ Nov 1: Rent  │ ←─── Appears automatically
    │ Dec 1: Rent  │      in timeline for each
    │ Jan 1: Rent  │      month until forecast
    └──────────────┘      end date
```

### Timeline Table Structure

```
Columns (Left to Right):
1. [Action]     → Delete button or "Auto" label
2. [Date]       → Transaction date (PROMINENT)
3. [Description]→ What the transaction is
4. [Amount]     → +/- money (colored)
5. [Balance]    → Running balance (MAIN FOCUS)
```

### Delete Functionality

```
Manual Transaction:
[🗑 Delete] Oct 5 | Groceries | -$200 | $4,800
     ↑
  Clickable - removes immediately

Auto-Generated:
[ Auto ] Oct 15 | Rent [Recurring] | -$1,500 | $3,300
     ↑
Cannot delete - from recurring template
(Delete the recurring template instead)
```

## Color Coding

- 🟢 **Green**: Positive balance, Income (Credit)
- 🔴 **Red**: Negative balance, Payments (Debit)
- 🔵 **Blue**: Recurring transaction badge
- ⚪ **Gray**: Auto-generated indicator

## Responsive Behavior

```
Desktop (Wide Screen):
├─────────┼──────────────┼─────────┤
│ Left    │   Center     │ Right   │
│ Sidebar │   Timeline   │ Sidebar │
└─────────┴──────────────┴─────────┘

Mobile/Tablet (Narrow):
┌─────────────────────┐
│   Account Balance   │
├─────────────────────┤
│  Forecast Settings  │
├─────────────────────┤
│   Balance Timeline  │
├─────────────────────┤
│  Add Transaction    │
├─────────────────────┤
│ Recurring Trans.    │
└─────────────────────┘
```

## Summary of Layout Changes

### What Was Removed ❌

- Transaction List component (middle column)
- Chart/Graph visualization
- Old 3-column equal layout

### What Was Added ✅

- New 3-column layout (3-6-3 grid)
- Table format for timeline
- Date column (prominent)
- Action column with delete buttons
- Day of month field for recurring
- Auto-generation of recurring transactions
- "Auto" and "Recurring" indicators

### What Moved 📦

- Account Balance: Now left sidebar top
- Forecast Settings: Now left sidebar second
- Add Transaction: Now right sidebar top
- Recurring Trans: Now right sidebar second
- Timeline: Now center, full width

---

**The new layout focuses on:**

1. **Date visibility** - Clear date column
2. **Balance tracking** - Prominent balance display
3. **Quick actions** - Delete buttons where needed
4. **Automation** - Recurring transactions auto-populate

Start using: `npm run dev`
