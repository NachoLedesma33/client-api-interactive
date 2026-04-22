# E2E Testing Guide

This document provides comprehensive information about the end-to-end testing setup for the API Client application.

## Overview

We use Playwright for E2E testing to ensure all aspects of the web application work correctly across different browsers and devices.

## Test Coverage

### 1. Basic Functionality (`basic-functionality.spec.ts`)
- Page loading and navigation
- Component visibility
- Layout structure

### 2. HTTP Requests (`http-requests.spec.ts`)
- GET, POST, PUT, DELETE requests
- Custom headers
- JSON and form data bodies
- Error handling
- Request history

### 3. Collections Management (`collections.spec.ts`)
- Create, edit, delete collections
- Add requests to collections
- Import/export collections
- Search functionality

### 4. Environments & Variables (`environments.spec.ts`)
- Create and manage environments
- Variable substitution
- Activate/deactivate environments
- Import/export environments

### 5. Keyboard Shortcuts (`keyboard-shortcuts.spec.ts`)
- Ctrl+Enter: Send request
- Ctrl+S: Save request
- Ctrl+N: New request
- Ctrl+H: Focus search
- F1: Show help
- Escape: Close modals
- Tab navigation

### 6. Responsive Design (`responsive-design.spec.ts`)
- Desktop, tablet, mobile viewports
- Touch interactions
- Accessibility
- Performance

### 7. Import/Export (`import-export.spec.ts`)
- Export/import requests
- Export/import collections
- Export/import environments
- cURL import
- Data integrity

## Running Tests

### Development
```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests with UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Specific Tests
```bash
# Run specific test file
npx playwright test tests/e2e/http-requests.spec.ts

# Run tests with specific pattern
npx playwright test --grep "HTTP Requests"

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop Chrome, Desktop Firefox, Desktop Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:4321`
- **Auto-server**: Starts dev server before tests
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Use descriptive test names**
2. **Group related tests with `test.describe`**
3. **Use `test.beforeEach` for common setup**
4. **Wait for elements properly**
5. **Use assertions to verify results**
6. **Test both positive and negative cases**

### Selectors
- Use semantic selectors when possible
- Prefer `data-testid` attributes for dynamic content
- Use accessible selectors (aria labels, roles)

### Waits
```typescript
// Wait for element to be visible
await expect(page.locator('.element')).toBeVisible();

// Wait for navigation
await page.waitForURL('/collections');

// Wait for network response
await page.waitForResponse('**/api/**');
```

## Continuous Integration

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) runs tests automatically:

- On push to main/develop branches
- On pull requests to main branch
- Uploads test reports and artifacts
- Runs on Ubuntu with all browsers

## Debugging

### Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode
```bash
npm run test:e2e:headed
```

### VS Code Integration
Install the Playwright VS Code extension for better debugging experience.

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## Test Data

Tests use real APIs when possible:
- `https://jsonplaceholder.typicode.com` - For general testing
- `https://httpbin.org` - For header and body testing

## Performance Considerations

- Tests run in parallel by default
- Use `test.skip()` to skip slow tests during development
- Configure timeouts appropriately
- Clean up test data after each test

## Troubleshooting

### Common Issues

1. **Tests fail to find elements**
   - Check if elements have proper selectors
   - Ensure elements are loaded before interaction
   - Use proper waits

2. **Tests timeout**
   - Increase timeout in config or individual tests
   - Check if server is running properly
   - Verify network connectivity

3. **Flaky tests**
   - Add proper waits
   - Use retry mechanism
   - Check for race conditions

### Browser-Specific Issues

- **Safari/WebKit**: May have different behavior for file uploads
- **Firefox**: May handle CSP differently
- **Chrome**: Generally most reliable

## Maintenance

- Update tests when UI changes
- Keep test data up to date
- Review and refactor test code regularly
- Monitor test execution times

## Coverage Goals

- **Critical paths**: 100% coverage
- **Main features**: 90%+ coverage
- **Edge cases**: 70%+ coverage
- **Error scenarios**: 80%+ coverage

## Future Improvements

- Add visual regression testing
- Implement performance testing
- Add accessibility testing
- Create component-level tests
- Add API contract testing
