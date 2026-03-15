import { GuidelineEntry } from '../../types';

/**
 * Compatibility Testing Guidelines
 * Cross-browser compatibility testing guidelines and techniques
 */

export const compatibilityTestingGuidelines: GuidelineEntry = {
  id: 'testing-compatibility',
  title: 'Cross-Browser Compatibility Testing',
  category: 'testing',
  priority: 'critical',
  description: 'Comprehensive guidelines for testing website compatibility across different browsers, devices, and operating systems to ensure consistent user experience.',
  rules: [
    {
      statement: 'Test on all major browsers including Chrome, Firefox, Safari, and Edge',
      rationale: 'Different browsers have varying implementations of web standards, and testing ensures consistent functionality across all platforms.',
      implementation: 'Use browser testing tools like BrowserStack, Sauce Labs, or Playwright to automate testing across multiple browsers.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['browserstack', 'sauce-labs', 'playwright']
      }
    },

    {
      statement: 'Test responsive design on multiple device sizes and orientations',
      rationale: 'Users access websites from various devices with different screen sizes, and responsive design must work correctly on all of them.',
      implementation: 'Test on mobile phones, tablets, and desktop screens in both portrait and landscape orientations using device emulation or real devices.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['responsive-design-checker', 'device-emulation']
      }
    },

    {
      statement: 'Verify JavaScript functionality across different browser versions',
      rationale: 'JavaScript features and APIs may not be supported in older browsers, requiring polyfills or alternative implementations.',
      implementation: 'Test JavaScript features using tools like Can I Use database and implement feature detection with appropriate fallbacks.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['caniuse-checker', 'feature-detection']
      }
    },

    {
      statement: 'Test CSS rendering and layout consistency across browsers',
      rationale: 'CSS properties and values may render differently across browsers, affecting visual consistency and layout.',
      implementation: 'Use CSS testing tools and visual regression testing to compare rendering across different browsers.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['css-compatibility-checker', 'visual-regression-testing']
      }
    },

    {
      statement: 'Validate form functionality and input handling across platforms',
      rationale: 'Form controls and input validation may behave differently across browsers and devices, affecting user interaction.',
      implementation: 'Test form submission, validation, and input types on different browsers and devices, including touch interfaces.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['form-testing-tools']
      }
    },

    {
      statement: 'Test performance characteristics across different environments',
      rationale: 'Performance can vary significantly between browsers and devices, affecting user experience and conversion rates.',
      implementation: 'Use performance testing tools to measure load times, rendering performance, and resource usage across different platforms.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['lighthouse', 'webpagetest', 'performance-monitoring']
      }
    },

    {
      statement: 'Implement automated cross-browser testing in CI/CD pipeline',
      rationale: 'Automated testing ensures compatibility issues are caught early and prevents regression in browser support.',
      implementation: 'Integrate browser testing tools into continuous integration workflow to run compatibility tests on every code change.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['ci-cd-integration']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Playwright Cross-Browser Testing Setup',
      goodExample: `// Good: Comprehensive cross-browser testing with Playwright
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
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
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
};

// tests/compatibility.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Cross-Browser Compatibility', () => {
  test('should render homepage correctly across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Test basic layout
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Test responsive navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Test form functionality
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    
    // Verify form submission works
    await expect(page.locator('.success-message')).toBeVisible();
  });
  
  test('should handle JavaScript features with fallbacks', async ({ page }) => {
    await page.goto('/interactive');
    
    // Test modern JavaScript features
    const supportsES6 = await page.evaluate(() => {
      try {
        eval('const test = () => true');
        return true;
      } catch (e) {
        return false;
      }
    });
    
    if (supportsES6) {
      // Test ES6 functionality
      await page.click('.modern-feature');
      await expect(page.locator('.es6-result')).toBeVisible();
    } else {
      // Test fallback functionality
      await page.click('.fallback-feature');
      await expect(page.locator('.fallback-result')).toBeVisible();
    }
  });
});`,
      badExample: `// Bad: Testing only on one browser
const { test, expect } = require('@playwright/test');

test('homepage works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});`,
      explanation: 'The good example tests across multiple browsers and devices, includes feature detection, and tests both modern and fallback functionality. The bad example only tests basic functionality on the default browser.'
    },

    {
      language: 'javascript',
      title: 'CSS Compatibility Testing with Visual Regression',
      goodExample: `// Good: Visual regression testing for CSS compatibility
// tests/visual-regression.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test('should render components consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/components');
    
    // Test button component
    const button = page.locator('.btn-primary');
    await expect(button).toHaveScreenshot(\`button-\${browserName}.png\`);
    
    // Test form component
    const form = page.locator('.contact-form');
    await expect(form).toHaveScreenshot(\`form-\${browserName}.png\`);
    
    // Test responsive grid
    await page.setViewportSize({ width: 768, height: 1024 });
    const grid = page.locator('.responsive-grid');
    await expect(grid).toHaveScreenshot(\`grid-tablet-\${browserName}.png\`);
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(grid).toHaveScreenshot(\`grid-mobile-\${browserName}.png\`);
  });
  
  test('should handle CSS feature support gracefully', async ({ page }) => {
    await page.goto('/css-features');
    
    // Test CSS Grid support
    const supportsGrid = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    
    if (supportsGrid) {
      await expect(page.locator('.grid-layout')).toBeVisible();
    } else {
      await expect(page.locator('.flexbox-fallback')).toBeVisible();
    }
    
    // Test CSS Custom Properties support
    const supportsCustomProps = await page.evaluate(() => {
      return CSS.supports('color', 'var(--test-color)');
    });
    
    if (supportsCustomProps) {
      const color = await page.locator('.custom-prop-element').evaluate(el => 
        getComputedStyle(el).color
      );
      expect(color).toBe('rgb(255, 0, 0)');
    }
  });
});

// CSS feature detection and fallbacks
/* Good: CSS with fallbacks */
.modern-layout {
  /* Flexbox fallback */
  display: flex;
  flex-wrap: wrap;
  
  /* Grid enhancement */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Feature query for enhanced support */
@supports (display: grid) {
  .modern-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@supports not (display: grid) {
  .modern-layout {
    display: flex;
    flex-wrap: wrap;
  }
  
  .modern-layout > * {
    flex: 1 1 300px;
    margin: 0.5rem;
  }
}`,
      badExample: `// Bad: No visual regression testing or feature detection
.layout {
  display: grid; /* No fallback */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

// No testing for CSS compatibility
test('page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});`,
      explanation: 'The good example includes visual regression testing, CSS feature detection, and appropriate fallbacks. The bad example uses modern CSS without fallbacks and lacks visual testing.'
    },

    {
      language: 'javascript',
      title: 'Feature Detection and Polyfill Loading',
      goodExample: `// Good: Feature detection with polyfill loading
// utils/featureDetection.js
class FeatureDetector {
  static supportsIntersectionObserver() {
    return 'IntersectionObserver' in window;
  }
  
  static supportsFetch() {
    return 'fetch' in window;
  }
  
  static supportsCustomElements() {
    return 'customElements' in window;
  }
  
  static supportsES6Modules() {
    try {
      new Function('import("")');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  static async loadPolyfillsIfNeeded() {
    const polyfills = [];
    
    if (!this.supportsFetch()) {
      polyfills.push(import('whatwg-fetch'));
    }
    
    if (!this.supportsIntersectionObserver()) {
      polyfills.push(import('intersection-observer'));
    }
    
    if (!this.supportsCustomElements()) {
      polyfills.push(import('@webcomponents/custom-elements'));
    }
    
    await Promise.all(polyfills);
  }
}

// main.js - Application initialization with feature detection
async function initializeApp() {
  // Load polyfills for unsupported features
  await FeatureDetector.loadPolyfillsIfNeeded();
  
  // Initialize features based on support
  if (FeatureDetector.supportsIntersectionObserver()) {
    initializeLazyLoading();
  } else {
    initializeFallbackScrollHandling();
  }
  
  if (FeatureDetector.supportsFetch()) {
    initializeModernAjax();
  } else {
    initializeXHRFallback();
  }
}

// Compatibility testing
describe('Feature Detection', () => {
  test('should load appropriate polyfills', async ({ page }) => {
    // Mock older browser
    await page.addInitScript(() => {
      delete window.fetch;
      delete window.IntersectionObserver;
    });
    
    await page.goto('/');
    
    // Verify polyfills were loaded
    const hasFetch = await page.evaluate(() => typeof fetch !== 'undefined');
    const hasIntersectionObserver = await page.evaluate(() => 
      typeof IntersectionObserver !== 'undefined'
    );
    
    expect(hasFetch).toBe(true);
    expect(hasIntersectionObserver).toBe(true);
  });
});`,
      badExample: `// Bad: No feature detection or polyfills
// Assumes all modern features are available
function initializeApp() {
  // Will break in older browsers
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      const observer = new IntersectionObserver(callback);
      observer.observe(document.querySelector('.lazy-load'));
    });
}`,
      explanation: 'The good example implements comprehensive feature detection, loads polyfills as needed, and provides fallbacks for unsupported features. The bad example assumes modern browser support and will break in older environments.'
    },

    {
      language: 'javascript',
      title: 'Automated Browser Testing in CI/CD',
      goodExample: `# Good: GitHub Actions workflow for cross-browser testing
# .github/workflows/cross-browser-tests.yml
name: Cross-Browser Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps \${{ matrix.browser }}
      
    - name: Start development server
      run: |
        npm run build
        npm run start &
        npx wait-on http://localhost:3000
        
    - name: Run Playwright tests
      run: npx playwright test --project=\${{ matrix.browser }}
      
    - uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report-\${{ matrix.browser }}
        path: playwright-report/
        retention-days: 30

  visual-regression:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright
      run: npx playwright install --with-deps
      
    - name: Run visual regression tests
      run: npx playwright test --grep "visual"
      
    - name: Upload visual diff artifacts
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: visual-regression-diffs
        path: test-results/

# package.json scripts for local testing
{
  "scripts": {
    "test:cross-browser": "playwright test",
    "test:chromium": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:webkit": "playwright test --project=webkit",
    "test:mobile": "playwright test --grep mobile",
    "test:visual": "playwright test --grep visual"
  }
}`,
      badExample: `# Bad: No automated cross-browser testing
# Only basic unit tests
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm test`,
      explanation: 'The good example implements comprehensive cross-browser testing in CI/CD with multiple browsers, visual regression testing, and proper artifact collection. The bad example only runs basic unit tests without browser compatibility verification.'
    }
  ],
  relatedGuidelines: [
    'testing-strategy',
    'testing-markup-validation',
    'performance-responsive-design',
    'accessibility-wcag-standards'
  ]
};