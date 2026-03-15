import { GuidelineEntry } from '../../types';

/**
 * Automated Testing Guidelines
 * Testing framework and tool recommendations with setup examples
 */

export const automatedTestingGuidelines: GuidelineEntry = {
  id: 'testing-automated',
  title: 'Automated Testing Guidelines',
  category: 'testing',
  priority: 'critical',
  description: 'Comprehensive guidelines for implementing automated testing frameworks, tools, and continuous integration workflows to ensure consistent code quality and catch issues early.',
  rules: [
    {
      statement: 'Implement continuous integration (CI) pipeline with automated test execution',
      rationale: 'CI pipelines ensure tests run automatically on every code change, preventing broken code from reaching production and maintaining code quality standards.',
      implementation: 'Set up CI/CD pipeline using GitHub Actions, Jenkins, or similar tools to run tests on pull requests and main branch commits.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['github-actions', 'jenkins', 'gitlab-ci']
      }
    },

    {
      statement: 'Use modern testing frameworks appropriate for the technology stack',
      rationale: 'Modern testing frameworks provide better developer experience, faster execution, and more comprehensive testing capabilities.',
      implementation: 'Choose frameworks like Jest for JavaScript, Pytest for Python, or RSpec for Ruby based on project requirements and team expertise.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['jest', 'vitest', 'pytest', 'rspec']
      }
    },

    {
      statement: 'Implement test coverage reporting and enforce minimum coverage thresholds',
      rationale: 'Coverage reporting identifies untested code paths and helps maintain consistent testing standards across the codebase.',
      implementation: 'Configure coverage tools to generate reports and set minimum thresholds (typically 80% for critical paths) in CI pipeline.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['istanbul', 'nyc', 'coverage.py']
      }
    },

    {
      statement: 'Set up automated end-to-end testing for critical user workflows',
      rationale: 'E2E tests validate complete user journeys and catch integration issues that unit tests might miss.',
      implementation: 'Use tools like Playwright, Cypress, or Selenium to automate testing of key user flows like registration, login, and core features.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['playwright', 'cypress', 'selenium']
      }
    },

    {
      statement: 'Implement parallel test execution to optimize CI/CD pipeline performance',
      rationale: 'Parallel execution reduces test suite runtime, enabling faster feedback cycles and more efficient development workflows.',
      implementation: 'Configure test runners to execute tests in parallel and distribute test suites across multiple CI workers.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['jest-parallel', 'pytest-xdist', 'ci-parallelization']
      }
    },

    {
      statement: 'Set up automated visual regression testing for UI components',
      rationale: 'Visual regression testing catches unintended UI changes and ensures consistent visual appearance across different environments.',
      implementation: 'Use tools like Percy, Chromatic, or Playwright visual comparisons to automatically detect visual changes in UI components.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['percy', 'chromatic', 'playwright-visual']
      }
    },

    {
      statement: 'Implement test data management and database seeding for consistent test environments',
      rationale: 'Consistent test data ensures reliable test results and prevents flaky tests caused by data dependencies.',
      implementation: 'Create test fixtures, database seeders, and data factories to provide consistent, isolated test data for each test run.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['factory-bot', 'faker', 'test-fixtures']
      }
    },

    {
      statement: 'Configure automated security testing and dependency vulnerability scanning with appropriate tool recommendations',
      rationale: 'Automated security testing identifies vulnerabilities early in the development process, reducing security risks in production.',
      implementation: 'Integrate security scanning tool recommendations like Snyk, OWASP ZAP, or npm audit into the CI pipeline to check for known vulnerabilities.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['snyk', 'owasp-zap', 'npm-audit']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Jest Testing Framework Setup',
      goodExample: `// Good: Comprehensive Jest configuration
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/setupTests.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  }
};

// src/setupTests.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock global objects
global.fetch = jest.fn();
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Example test file
// src/components/__tests__/Button.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  test('should render button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});`,
      badExample: `// Bad: Minimal Jest setup without proper configuration
// jest.config.js
module.exports = {
  testEnvironment: 'node'
};

// Basic test without proper setup
test('button works', () => {
  expect(true).toBe(true);
});`,
      explanation: 'The good example provides comprehensive Jest configuration with coverage thresholds, proper test environment setup, and well-structured tests. The bad example lacks configuration and meaningful tests.'
    },

    {
      language: 'javascript',
      title: 'GitHub Actions CI/CD Pipeline',
      goodExample: `# Good: Comprehensive CI/CD pipeline with automated testing
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}

  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: |
        npm run start &
        npx wait-on http://localhost:3000
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [test, security, e2e]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to staging
      run: echo "Deploying to staging..."
    
    - name: Run smoke tests
      run: npm run test:smoke
    
    - name: Deploy to production
      if: success()
      run: echo "Deploying to production..."

# package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:smoke": "jest --testPathPattern=smoke",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}`,
      badExample: `# Bad: Basic CI without comprehensive testing
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: npm install
    - run: npm test`,
      explanation: 'The good example implements a comprehensive CI/CD pipeline with multiple test types, security scanning, parallel execution, and proper deployment gates. The bad example only runs basic tests without proper validation.'
    },

    {
      language: 'javascript',
      title: 'Playwright E2E Testing Setup',
      goodExample: `// Good: Comprehensive Playwright E2E testing setup
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});

// e2e/fixtures/test-data.js
export class TestDataManager {
  constructor() {
    this.users = {
      validUser: {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      },
      adminUser: {
        email: 'admin@example.com',
        password: 'AdminPass123!',
        name: 'Admin User'
      }
    };
  }

  async createTestUser(page, userType = 'validUser') {
    const user = this.users[userType];
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', user.name);
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="register-button"]');
    return user;
  }

  async loginUser(page, userType = 'validUser') {
    const user = this.users[userType];
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    return user;
  }
}

// e2e/tests/user-authentication.spec.js
import { test, expect } from '@playwright/test';
import { TestDataManager } from '../fixtures/test-data';

test.describe('User Authentication', () => {
  let testData;

  test.beforeEach(async ({ page }) => {
    testData = new TestDataManager();
    // Clean up any existing test data
    await page.goto('/test-cleanup');
  });

  test('should allow user registration with valid data', async ({ page }) => {
    const user = await testData.createTestUser(page);
    
    // Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText(user.name);
  });

  test('should prevent registration with invalid email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="register-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email format');
    
    // Verify user stays on registration page
    await expect(page).toHaveURL('/register');
  });

  test('should allow user login with valid credentials', async ({ page }) => {
    // First create a user
    await testData.createTestUser(page);
    
    // Then test login
    await testData.loginUser(page);
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    await testData.loginUser(page);
    
    // Logout
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });
});`,
      badExample: `// Bad: Basic E2E test without proper setup
import { test, expect } from '@playwright/test';

test('login works', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('#login');
  await expect(page.locator('h1')).toContainText('Dashboard');
});`,
      explanation: 'The good example provides comprehensive E2E testing with proper configuration, test data management, multiple browsers, and detailed test scenarios. The bad example lacks proper setup and comprehensive testing.'
    },

    {
      language: 'javascript',
      title: 'Visual Regression Testing with Percy',
      goodExample: `// Good: Visual regression testing setup with Percy
// .percy.yml
version: 2
snapshot:
  widths: [375, 768, 1280]
  min-height: 1024
  percy-css: |
    .dynamic-content { display: none !important; }
    .timestamp { visibility: hidden; }

// tests/visual-regression.spec.js
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport and disable animations
    await page.addInitScript(() => {
      // Disable CSS animations and transitions
      const style = document.createElement('style');
      style.innerHTML = \`
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      \`;
      document.head.appendChild(style);
    });
  });

  test('should capture homepage visual state', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements
    await page.addStyleTag({
      content: \`
        .loading-spinner { display: none !important; }
        .timestamp { visibility: hidden !important; }
      \`
    });
    
    await percySnapshot(page, 'Homepage');
  });

  test('should capture component library states', async ({ page }) => {
    await page.goto('/components');
    await page.waitForLoadState('networkidle');
    
    // Test different component states
    await percySnapshot(page, 'Components - Default State');
    
    // Test hover states
    await page.hover('[data-testid="primary-button"]');
    await percySnapshot(page, 'Components - Button Hover');
    
    // Test form validation states
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.blur('[data-testid="email-input"]');
    await page.waitForSelector('[data-testid="error-message"]');
    await percySnapshot(page, 'Components - Form Validation Error');
  });

  test('should capture responsive design breakpoints', async ({ page }) => {
    await page.goto('/responsive-demo');
    await page.waitForLoadState('networkidle');
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, 'Responsive Design - Mobile');
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, 'Responsive Design - Tablet');
    
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await percySnapshot(page, 'Responsive Design - Desktop');
  });

  test('should capture dark mode theme', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForSelector('[data-theme="dark"]');
    
    await percySnapshot(page, 'Homepage - Dark Mode');
  });
});

// CI/CD integration
// .github/workflows/visual-tests.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [ main ]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: |
        npm run start &
        npx wait-on http://localhost:3000
    
    - name: Run visual regression tests
      run: npx percy exec -- npx playwright test visual-regression.spec.js
      env:
        PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}`,
      badExample: `// Bad: No visual regression testing
// Only functional tests without visual validation
test('page looks correct', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});`,
      explanation: 'The good example implements comprehensive visual regression testing with Percy, including responsive breakpoints, component states, and CI/CD integration. The bad example lacks visual validation entirely.'
    }
  ],
  relatedGuidelines: [
    'testing-strategy',
    'testing-compatibility',
    'testing-deployment-validation',
    'performance-monitoring'
  ]
};