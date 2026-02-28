## Development Workflow

- Run `./start.sh` to install dependencies, build frontend, and start dev servers.

## Project Structure

```
MMMF/
  client/          # React 19 + Vite frontend (Tailwind CSS v4)
  server/          # Express.js backend API (file-based JSON storage)
  cloudflare/      # Hono-based Cloudflare Workers/Pages deployment
  doc/             # Screenshots and media
```

## Architecture

- Express server reads/writes JSON files in `data/` directory.
- Hono app (`server/hono-app.js`) mirrors Express API but uses Cloudflare KV for storage.
- Demo mode (`server/demo-session.js`) provides isolated sessions with auto-cleanup.
- Frontend is a single-page React app; Vite proxies `/api` to Express in dev.
- Production: Express serves built `dist/` as static files with SPA fallback.

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
- Server logs: ASCII only, format `[LEVEL] [ServiceName] Message`
- Server files: `{entity}Controller.js`, `{name}Service.js`, `{entity}.js` (routes)
- Client files: `{PageName}.jsx` (pages), `{ComponentName}.jsx` (components)
- Naming: camelCase (vars/functions), PascalCase (components), snake_case (DB columns/tables)

## Data Format

- All data stored as JSON arrays in `data/*.json`.
- IDs generated via `Date.now().toString()`.
- Settings object: `{ startingBalance, currentDate, forecastEndDate, currencySymbol, dateFormat, language }`.
- Recurring items: `{ id, name, amount, dayOfMonth, type: "debit"|"credit" }`.
- Credit cards: `{ id, name, dayOfMonth }` — amounts added per billing cycle as transactions.

## Versioning

- Update CHANGELOG.md `## [Unreleased]` section for every feature or fix
