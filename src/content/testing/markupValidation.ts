import { GuidelineEntry } from '../../types';

/**
 * Markup Validation Guidelines
 * Standards compliance checks and validation tools for HTML, CSS, and JavaScript
 */

export const markupValidationGuidelines: GuidelineEntry = {
  id: 'testing-markup-validation',
  title: 'Markup Validation Guidelines',
  category: 'testing',
  priority: 'critical',
  description: 'Comprehensive guidelines for validating HTML markup, CSS styles, and JavaScript code to ensure standards compliance and catch syntax errors early.',
  rules: [
    {
      statement: 'Validate all HTML markup against W3C HTML5 standards',
      rationale: 'Valid HTML ensures consistent rendering across browsers, improves accessibility, and prevents unexpected behavior.',
      implementation: 'Use W3C Markup Validator or automated tools like html-validate to check HTML syntax and structure.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['w3c-validator', 'html-validate']
      }
    },

    {
      statement: 'Validate CSS against W3C CSS standards and check for syntax errors',
      rationale: 'Valid CSS prevents rendering issues, improves browser compatibility, and ensures styles work as intended.',
      implementation: 'Use W3C CSS Validator or tools like stylelint to check CSS syntax, properties, and values.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['w3c-css-validator', 'stylelint']
      }
    },

    {
      statement: 'Use JavaScript linting tools to catch syntax and logic errors',
      rationale: 'Linting catches common errors, enforces coding standards, and identifies potential bugs before runtime.',
      implementation: 'Configure ESLint with appropriate rules for your project and integrate it into your build process.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['eslint', 'jshint']
      }
    },

    {
      statement: 'Implement automated validation in the build pipeline',
      rationale: 'Automated validation prevents invalid code from reaching production and ensures consistent quality standards.',
      implementation: 'Add validation steps to CI/CD pipeline using tools like GitHub Actions, Jenkins, or similar platforms.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['ci-cd-pipeline']
      }
    },

    {
      statement: 'Check for accessibility compliance using automated tools',
      rationale: 'Automated accessibility testing catches common WCAG violations and ensures basic accessibility standards are met.',
      implementation: 'Use tools like axe-core, Pa11y, or Lighthouse accessibility audits in your testing workflow.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['axe-core', 'pa11y', 'lighthouse']
      }
    },

    {
      statement: 'Validate semantic HTML structure and proper element usage',
      rationale: 'Semantic HTML improves SEO, accessibility, and code maintainability by using elements according to their intended purpose.',
      implementation: 'Check that headings follow hierarchy, forms use proper labels, and content uses appropriate semantic elements.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['html-validate', 'semantic-checker']
      }
    },

    {
      statement: 'Test for broken links and missing resources',
      rationale: 'Broken links and missing resources create poor user experience and can indicate deployment or configuration issues.',
      implementation: 'Use link checkers and resource validators to ensure all URLs and file references are accessible.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['broken-link-checker', 'resource-validator']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'HTML Validation with html-validate',
      goodExample: `// Good: Automated HTML validation setup
// package.json
{
  "scripts": {
    "validate:html": "html-validate 'src/**/*.html'",
    "test": "npm run validate:html && jest"
  },
  "devDependencies": {
    "html-validate": "^7.0.0"
  }
}

// .htmlvalidate.json configuration
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "require-sri": "error",
    "no-trailing-whitespace": "error",
    "element-required-attributes": "error",
    "element-permitted-content": "error"
  }
}

// Example validation in Node.js
const { HtmlValidate } = require('html-validate');

async function validateHTML(htmlContent) {
  const htmlvalidate = new HtmlValidate();
  const report = await htmlvalidate.validateString(htmlContent);
  
  if (!report.valid) {
    console.error('HTML validation errors:');
    report.results.forEach(result => {
      result.messages.forEach(message => {
        console.error(\`Line \${message.line}: \${message.message}\`);
      });
    });
    return false;
  }
  
  return true;
}`,
      badExample: `// Bad: No validation, manual checking only
// No automated validation setup
// Relying on browser developer tools only
function checkHTML() {
  console.log('Remember to check HTML manually');
}`,
      explanation: 'The good example sets up automated HTML validation with proper configuration and error reporting. The bad example relies on manual checking, which is error-prone and inconsistent.'
    },

    {
      language: 'javascript',
      title: 'CSS Validation with Stylelint',
      goodExample: `// Good: Comprehensive CSS linting setup
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-no-invalid-hex": true,
    "declaration-colon-space-after": "always",
    "declaration-colon-space-before": "never",
    "function-comma-space-after": "always",
    "function-url-quotes": "always",
    "media-feature-colon-space-after": "always",
    "media-feature-colon-space-before": "never",
    "no-duplicate-selectors": true,
    "no-empty-source": true,
    "property-no-unknown": true,
    "selector-pseudo-class-no-unknown": true,
    "unit-no-unknown": true
  }
}

// package.json
{
  "scripts": {
    "lint:css": "stylelint 'src/**/*.css'",
    "lint:css:fix": "stylelint 'src/**/*.css' --fix",
    "validate": "npm run lint:css && npm run test"
  }
}

// Automated CSS validation in build process
const stylelint = require('stylelint');

async function validateCSS(cssContent) {
  try {
    const result = await stylelint.lint({
      code: cssContent,
      formatter: 'string'
    });
    
    if (result.errored) {
      console.error('CSS validation errors:', result.output);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CSS validation failed:', error);
    return false;
  }
}`,
      badExample: `// Bad: No CSS validation
// No linting configuration
// Manual checking only
.my-class {
  colr: red; /* Typo not caught */
  margin: 10px 20px 30px 40px 50px; /* Invalid value not caught */
}`,
      explanation: 'The good example uses Stylelint with comprehensive rules to catch CSS errors automatically. The bad example shows common CSS errors that would go undetected without validation.'
    },

    {
      language: 'javascript',
      title: 'ESLint Configuration for JavaScript Validation',
      goodExample: `// Good: Comprehensive ESLint setup
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error'
  }
};

// package.json
{
  "scripts": {
    "lint:js": "eslint 'src/**/*.{js,ts}'",
    "lint:js:fix": "eslint 'src/**/*.{js,ts}' --fix",
    "validate": "npm run lint:js && npm run test"
  }
}

// Programmatic ESLint usage
const { ESLint } = require('eslint');

async function validateJavaScript(filePaths) {
  const eslint = new ESLint({ fix: false });
  const results = await eslint.lintFiles(filePaths);
  
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  
  const hasErrors = results.some(result => result.errorCount > 0);
  
  if (hasErrors) {
    console.error('JavaScript validation errors:');
    console.error(resultText);
    return false;
  }
  
  return true;
}`,
      badExample: `// Bad: No JavaScript validation
// No ESLint configuration
function myFunction() {
  var unusedVariable = 'test'; // Not caught
  if (condition = true) { // Assignment instead of comparison
    console.log('This runs always'); // Logic error not caught
  }
}`,
      explanation: 'The good example uses ESLint with comprehensive rules to catch syntax errors, logic issues, and enforce best practices. The bad example shows common JavaScript errors that would go undetected.'
    },

    {
      language: 'javascript',
      title: 'Accessibility Validation with axe-core',
      goodExample: `// Good: Automated accessibility testing
const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');

async function validateAccessibility(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url);
    
    const results = await new AxePuppeteer(page).analyze();
    
    if (results.violations.length > 0) {
      console.error('Accessibility violations found:');
      results.violations.forEach(violation => {
        console.error(\`\${violation.id}: \${violation.description}\`);
        violation.nodes.forEach(node => {
          console.error(\`  - \${node.html}\`);
          console.error(\`    \${node.failureSummary}\`);
        });
      });
      return false;
    }
    
    console.log('No accessibility violations found');
    return true;
  } finally {
    await browser.close();
  }
}

// Jest test integration
describe('Accessibility Tests', () => {
  test('should have no accessibility violations on homepage', async () => {
    const isAccessible = await validateAccessibility('http://localhost:3000');
    expect(isAccessible).toBe(true);
  });
});

// CI/CD integration
// .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run accessibility tests
        run: npm run test:accessibility`,
      badExample: `// Bad: No automated accessibility testing
// Manual testing only
// No systematic approach to accessibility validation
function checkAccessibility() {
  console.log('Remember to test with screen reader');
}`,
      explanation: 'The good example implements automated accessibility testing with axe-core, providing detailed violation reports and CI/CD integration. The bad example relies on manual testing, which is inconsistent and incomplete.'
    }
  ],
  relatedGuidelines: [
    'testing-strategy',
    'testing-compatibility',
    'accessibility-wcag-standards',
    'code-quality-html-best-practices'
  ]
};