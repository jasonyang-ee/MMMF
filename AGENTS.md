## Development Workflow

- Run `./start.sh` to install dependencies, build frontend, and start dev servers.
- `npm run dev` starts both Express server (port 3600) and Vite client (port 5173) via concurrently.
- `npm run build` builds the frontend with Vite.

## Project Structure

```
MMMF/
  client/          # React 19 + Vite frontend (Tailwind CSS v4)
  server/          # Express.js backend API (file-based JSON storage)
  cloudflare/      # Hono-based Cloudflare Workers/Pages deployment
  data/            # JSON data files (transactions, recurring, settings, credit-cards)
  dist/            # Built frontend output
  doc/             # Screenshots and media
  .github/         # CI/CD workflows (release + testing)
```

## Technology Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, react-datepicker, react-dnd
- **Backend:** Express 5 (Node.js >=20), file-based JSON persistence, express-rate-limit
- **Cloudflare:** Hono 4 with KV storage, demo mode with session isolation
- **i18n:** Custom hook (`useI18n`) supporting en, es, zht, ja
- **Deployment:** Docker (multi-arch), Cloudflare Workers, Cloudflare Pages

## Architecture

- Express server reads/writes JSON files in `data/` directory.
- Hono app (`server/hono-app.js`) mirrors Express API but uses Cloudflare KV for storage.
- Demo mode (`server/demo-session.js`) provides isolated sessions with auto-cleanup.
- Frontend is a single-page React app; Vite proxies `/api` to Express in dev.
- Production: Express serves built `dist/` as static files with SPA fallback.

## API Endpoints

All endpoints under `/api/` with CRUD operations:

- `/api/transactions` - one-time transactions
- `/api/recurring` - recurring debits/credits with dayOfMonth
- `/api/credit-cards` - credit cards with variable monthly amounts
- `/api/settings` - balance, dates, currency, language, date format

## Key Frontend Components

- `App.jsx` - main state management and API calls
- `BalanceTimeline.jsx` - forecast chart visualization
- `RecurringList.jsx` - recurring debits/credits management
- `RecurringCreditCards.jsx` - credit cards with per-cycle payment input
- `TransactionForm.jsx` / `TransactionList.jsx` - one-time transaction entry
- `GlobalSettings.jsx` / `ForecastSettings.jsx` - app configuration
- `DarkModeToggle.jsx` - theme switching

## Code Style

- ES Modules throughout (`"type": "module"` in package.json).
- React components use JSX with hooks (useState, useEffect, useRef).
- Inline editing pattern: useRef + useEffect for focus/select, Enter to save, Escape to cancel.
- Tailwind utility classes for styling; dark mode via class-based toggle.
- Config files (vite, postcss, tailwind) live inside `client/`, not root.

## Data Format

- All data stored as JSON arrays in `data/*.json`.
- IDs generated via `Date.now().toString()`.
- Settings object: `{ startingBalance, currentDate, forecastEndDate, currencySymbol, dateFormat, language }`.
- Recurring items: `{ id, name, amount, dayOfMonth, type: "debit"|"credit" }`.
- Credit cards: `{ id, name, dayOfMonth }` — amounts added per billing cycle as transactions.
