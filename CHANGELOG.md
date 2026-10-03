# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-10-03

### Added

- Searchable language and currency selectors with native/English names, currency codes and symbols, bounded scrolling, keyboard selection, and no-results feedback
- Complete and activate all 20 existing language entries, including Arabic RTL, localized calendars/amounts, status messages and currency-specific amount precision
- Node API/forecast/localization regressions and Playwright checks for selection, save failures, calendars, themes and multilingual mobile layouts
- Expanded `SPEC.md` covering architecture, data contracts, UI behavior, localization extension rules, verification and storage limits; whole-repository coverage in `REVIEW.md`

### Fixed

- Express supports an opt-in `TRUST_PROXY` IP/CIDR allowlist so trusted HTTPS proxies set Secure demo cookies and preserve per-client rate limits; malformed configuration stops startup, untrusted forwarding stays ignored, and deployment examples keep proxy trust disabled by default
- Existing names longer than 200 characters remain readable, editable and deletable without truncation; untouched inline names keep their original whitespace, and linked card payments can inherit the exact stored card name while new and changed names retain validation
- Express API rate limiting and demo-session isolation now apply to every API request; Hono adds per-isolate throttling, bounded request bodies, validated cookies and automatic demo-key expiry
- Shared API validation protects dates, amounts, settings and immutable IDs/timestamps; partial settings updates preserve other fields, invalid saved languages fall back to English, storage corruption returns visible errors, and local file updates use serialized atomic replacement
- Forecasts use calendar dates across timezones, exclude transactions outside the range, and only suppress recurring entries with matching type; card scheduling includes the start day and unpaid gaps, with stable links for new card payments
- Load/save failures are visible, drafts survive failed submissions, and duplicate pending submissions are blocked; initial demo loading establishes one cookie before parallel reads
- Calendar and inline editors support keyboards; controls have accessible names, focus indicators and consistent touch targets; calendar save errors appear inside the dialog, and the theme switch stays inside its track in RTL layouts
- Cloudflare Workers use the configured asset binding and SPA fallback; Pages discovers the API entry from the root functions directory; Docker includes shared modules
- Development startup uses the Node 24 floor and reliably cleans up child processes while preserving failure status; the Vite proxy preserves same-origin saves, and deployment/contribution documentation and CI checks match actual paths and scripts
- Compatible dependency updates resolve the audit findings; removed unused drag-and-drop, date-picker/date utility and legacy asset-handler dependencies, plus obsolete Tailwind configuration and unused native date-input styles

## [1.1.5] - 2026-07-19

### Changed

- Restored the v1.1.4 three-column desktop layout (balance/settings | timeline | credit cards/recurring/entry), now appearing from 1100px instead of 1420px and collapsing to a single-column stack below that; removed the intermediate two-column tier
- Interactive controls (delete buttons, dark-mode toggle, debit/credit type toggle, date-picker navigation and day cells) now meet the 44px minimum touch-target size on mobile
- Unified duplicated UI into shared building blocks: a `DeleteButton` component (bakes the 44px hit area), a `TypeToggle` debit/credit selector, and `.btn-submit`/`.btn-link` classes; removed dead `TransactionList` and `DarkModeToggle` components

### Fixed

- Language cookie validation used `"jp"` instead of `"ja"` — Japanese preference was lost on every page refresh
- `DEFAULT_LANGUAGE` env var now accepts `zht` and `ja` in addition to `en`/`es`
- All server write routes (`POST`/`PUT`/`DELETE`) now return 500 cleanly when JSON file is unreadable instead of crashing with TypeError
- `PUT /api/settings` now rejects unsupported languages and non-numeric starting balances with 400
- Client API calls now throw on non-2xx responses; write handlers log failures instead of silently applying state
- Production CORS now rejects unconfigured origins in Express and Hono while development remains permissive
- Cloudflare (Hono) runtime brought to parity with the Express server: `PUT /api/settings` now validates language and starting balance (400 on invalid), and the CORS origin allowlist reads the Workers `ALLOWED_ORIGIN` environment binding (`c.env`) instead of `process.env`, which the Workers runtime does not populate — so a configured allowed origin now takes effect
- Release helper now supports dry-run, guarded tags/changelog, body-aware breaking detection, and CI-owned GitHub Releases
- CI `Cloudflare_Build_Test` job now runs Node 24 (was 20), matching `package.json` engines and clearing the Wrangler ≥22 requirement, so the Wrangler validation step no longer fails with "Wrangler requires at least Node.js v22.0.0"
- GHCR cleanup no longer orphans tagged multi-arch/attested images: replaced `actions/delete-package-versions` (not manifest-aware) with `dataaxiom/ghcr-cleanup-action`, which excludes untagged child/platform manifests referenced by a tagged index — fixing `docker pull ghcr.io/<owner>/mmmf:<tag>` failing with `manifest unknown` after a build; `validate: true` fails the job if any tagged image is left orphaned
- GHCR cleanup workflow targeted stale package name `iclib`; now uses the repository name so untagged images are actually deleted
- Dependabot no longer auto-opens version-update PRs (`open-pull-requests-limit: 0`); security alerts remain governed by repo settings

## [1.1.4] - 2026-04-07

### Added

- Mobile mode

## [1.1.3] - 2026-02-27

### Added

- Auto-focus amount input when opening credit card payment form

### Changed

- Build output directory moved from `/dist` to `/client/dist`
- Server logging format updated with structured `[INFO]`/`[ERROR]` prefixes
- `start.sh` rewritten with graceful shutdown, startup failure detection, and process management
- Node.js 20+ is now strictly required (previously a warning)
- Cloudflare deployment paths updated in `wrangler.jsonc`
- NPM scripts simplified; added `start` script for production
- Package dependencies updated

### Fixed

- CI pipeline updated to reference new `client/dist` build output path

### Removed

- Windows platform notes from README

## [1.1.2] - 2026-01-27

### Fixed

- Security fix for package and rate limiting on api access

## [1.1.1] - 2026-01-17

### Fixed

- minor ci bug

## [1.1.0] - 2026-01-17

### Added

- More blank i18n keys for future translations

### Changed

- Refactored project structure for better maintainability
- Updated dependencies to latest versions

## [1.0.8] - 2025-12-17

### Changed

- Version bump for dependency updates
- Fixed test to match new title
- Fixed app routing issues

### Fixed

- Using lock file for npm install
- Various build and test improvements

## [1.0.7] - 2025-12-07

### Changed

- Clean up merge from demo mode
- Package updates for security and performance

### Added

- Demo mode feature for online testing
- Cloudflare Workers and Pages dual deployment support

## [1.0.6] - 2025-11-23

### Changed

- Removed support for ARM32 architecture
- Optimized build process and CI pipeline

### Added

- Cloudflare KV storage integration
- Proper routing for Cloudflare deployment

## [1.0.5] - 2025-10-18

### Changed

- Reduced Docker image size
- Build optimizations

### Fixed

- Calendar reference issues

## [1.0.4] - 2025-10-18

### Added

- Japanese language support (ja)
- Traditional Chinese language support (zht)
- Custom scrollbar styling
- Spanish translation and Quetzal currency support

### Changed

- Updated layout to match improved style
- Updated Docker Compose configuration and documentation

### Fixed

- Calendar reference issue

## [1.0.3] - 2025-10-05

### Added

- GitHub link in header
- MIT license

### Changed

- Updated documentation
- Better demo section in README

## [1.0.2] - 2025-10-05

### Added

- Calendar auto reset on clear data
- Auto highlight starting balance on click
- Credit before debit ordering on balance timeline
- Better date picker

### Changed

- Click to edit functionality for all items
- Aligned style across components
- Better example data and initial setup

## [1.0.1] - 2025-10-05

### Added

- Docker health check
- Alpine-based image with curl for health checks

### Changed

- Using Alpine Linux base image for smaller footprint
- Better documentation for local development

## [1.0.0] - 2025-10-04

### Added

- Initial release of MMMF (Max Money Market Funds)
- Balance forecasting functionality
- Transaction management (add, edit, delete)
- Recurring transaction support
- Credit card payment tracking
- Balance timeline visualization
- Dark mode support
- Global settings for currency and date format
- Multi-language support (English, Spanish)
- Docker containerization
- Express.js server with file-based JSON storage
- React frontend with Vite build system
- Tailwind CSS for styling
- Responsive layout design

### Technical

- Node.js runtime
- React 18+ with hooks
- Tailwind CSS v4
- Express.js REST API
- Vite for frontend build
- Docker multi-stage build
[1.1.5]: https://github.com/jasonyang-ee/MMMF/releases/tag/v1.1.5
[Unreleased]: https://github.com/jasonyang-ee/MMMF/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/jasonyang-ee/MMMF/releases/tag/v1.2.0
