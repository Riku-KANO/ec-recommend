# E2E Testing Setup

This directory contains end-to-end tests for the EC Recommend application using Playwright.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Installation

```bash
cd e2e
npm install
npx playwright install
```

## Running Tests

### Option 1: Mock Application Tests (Recommended for CI/CD)
Run tests with lightweight mock applications:
```bash
npm run test:with-docker
```

### Option 2: Real Application Tests
Run tests with actual frontend and backend applications:
```bash
npm run test:with-real
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with Playwright UI
```bash
npm run test:ui
```

## Docker Commands

### Start containers manually
```bash
npm run docker:up
```

### Stop containers
```bash
npm run docker:down
```

### Clean up containers and volumes
```bash
npm run docker:clean
```

## Test Structure

```
e2e/
├── auth/                      # Authentication related tests
│   ├── login.spec.ts         # Mock app login tests
│   ├── signup.spec.ts        # Mock app signup tests
│   ├── login-real.spec.ts    # Real app login tests
│   └── signup-real.spec.ts   # Real app signup tests
├── config/                    # Configuration files
│   ├── docker-compose.yml        # Mock app Docker config
│   ├── docker-compose-real.yml   # Real app Docker config
│   ├── frontend.Dockerfile       # Mock frontend Dockerfile
│   ├── backend.Dockerfile        # Mock backend Dockerfile
│   ├── frontend-real.Dockerfile  # Real frontend Dockerfile
│   └── backend-real.Dockerfile   # Real backend Dockerfile
├── mocks/                     # Mock applications
│   ├── frontend/             # Mock frontend server
│   └── backend/              # Mock backend server
├── playwright.config.ts
├── package.json
├── TESTING_GUIDE.md          # Detailed testing guide
└── README.md
```

## Environment Setup

The tests use Docker containers for:
- **Frontend**: React application on port 3000
- **Backend**: Node.js API on port 8080
- **Cognito Mock**: Moto server on port 5000

## Writing New Tests

1. Create a new test file in the appropriate directory
2. Import necessary utilities from `@playwright/test`
3. Use the Cognito setup utilities for authentication tests
4. Follow the existing test patterns

Example:
```typescript
import { test, expect } from '@playwright/test';

test('your test description', async ({ page }) => {
  await page.goto('/your-route');
  // Your test assertions
});
```

## CI/CD Integration

The tests are configured to run in CI environments with:
- Retries on failure
- Parallel execution disabled for stability
- Screenshots on failure
- Trace on first retry