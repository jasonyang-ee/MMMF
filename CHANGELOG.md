# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 

### Changed

- 

### Fixed

- 

## [1.1.0] - 2026-01-17

### Added

-

### Changed

-

### Fixed

-

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
