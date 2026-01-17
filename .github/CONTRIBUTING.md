# Contributing to MMMF

Thank you for your interest in contributing to MMMF (Max Money Market Funds)! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Style Guide](#style-guide)

## Code of Conduct

Please be respectful and considerate in all interactions. We welcome contributions from everyone regardless of experience level.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MMMF.git
   cd MMMF
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/jasonyang-ee/MMMF.git
   ```

## Development Setup

### Prerequisites

- Node.js 20+ (24 recommended)
- npm 10+
- Git
- Docker (optional, for containerized development)

### Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development servers**:

   ```bash
   ./start.sh
   # Or manually:
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3600

### Docker Development

```bash
docker-compose up --build
```

Access at http://localhost:5173

## Project Structure

```
MMMF/
├── client/                 # React frontend
│   ├── components/         # React components
│   ├── api.js             # API client
│   ├── App.jsx            # Main app component
│   ├── i18n.js            # Internationalization
│   ├── index.css          # Global styles
│   ├── main.jsx           # Entry point
│   └── utils.js           # Utility functions
├── server/                 # Express.js backend
│   ├── index.js           # Server entry point
│   ├── hono-app.js        # Hono app for Cloudflare
│   └── demo-session.js    # Demo mode utilities
├── data/                   # Local data storage (gitignored)
├── public/                 # Static assets
├── cloudflare/             # Cloudflare-specific files
│   ├── worker.js          # Cloudflare Worker entry
│   └── wrangler.jsonc     # Wrangler configuration
├── .github/                # GitHub Actions and templates
│   ├── workflows/         # CI/CD workflows
│   └── CONTRIBUTING.md    # This file
├── docker-compose.yml      # Docker Compose config
├── Dockerfile             # Docker build config
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind CSS config
```

## Making Changes

1. **Create a new branch** from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the style guide

3. **Test your changes** locally

4. **Commit your changes** following the commit guidelines

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

### Examples

```
feat(transactions): add bulk delete functionality
fix(timeline): correct date sorting order
docs: update API documentation
chore: update dependencies
```

## Pull Request Process

1. **Update your branch** with the latest main:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes

4. **Address review feedback** if any

5. **Squash commits** if requested

### PR Checklist

- [ ] Code follows the project style guide
- [ ] Self-reviewed the code
- [ ] Added/updated documentation if needed
- [ ] Added/updated tests if applicable
- [ ] All tests pass locally
- [ ] Branch is up-to-date with main

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing

1. Test all CRUD operations for transactions
2. Test recurring transactions generation
3. Test credit card payment tracking
4. Test date range selections
5. Test dark/light mode
6. Test language switching
7. Test responsive layout

## Style Guide

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Use meaningful variable and function names
- Keep components small and focused
- Use proper PropTypes or TypeScript types

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Ensure responsive design
- Support dark mode

### File Naming

- React components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Styles: `kebab-case.css`

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion on GitHub
- Contact the maintainers

Thank you for contributing! 🎉
