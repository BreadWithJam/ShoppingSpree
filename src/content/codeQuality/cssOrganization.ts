import { GuidelineEntry } from '../../types';

export const cssOrganization: GuidelineEntry = {
  id: 'css-organization',
  title: 'CSS Organization and Conventions',
  category: 'code-quality',
  priority: 'critical',
  description: 'CSS organization patterns and naming conventions for maintainable, scalable stylesheets.',
  rules: [
    {
      statement: 'Use consistent naming conventions (BEM methodology recommended)',
      rationale: 'Consistent naming prevents conflicts, improves maintainability, and makes CSS more predictable',
      implementation: 'Follow BEM (Block Element Modifier) pattern: .block__element--modifier. Use lowercase with hyphens for multi-word names',
      validation: {
        method: 'Code review and linting tools'
      }
    },
    {
      statement: 'Organize CSS properties in logical order within rules',
      rationale: 'Consistent property ordering improves readability and makes it easier to find specific properties',
      implementation: 'Group properties by type: positioning, box model, typography, visual effects, animations. Use tools like stylelint for enforcement',
      validation: {
        method: 'Automated linting with stylelint'
      }
    },
    {
      statement: 'Use CSS custom properties (variables) for repeated values',
      rationale: 'Variables improve maintainability, enable theming, and reduce duplication',
      implementation: 'Define custom properties in :root for global values, use locally scoped variables for component-specific values',
      validation: {
        method: 'Code review and automated analysis'
      }
    },
    {
      statement: 'Structure CSS files with clear sections and comments',
      rationale: 'Well-organized files are easier to navigate, maintain, and debug',
      implementation: 'Use section comments, group related rules, separate base styles from component styles',
      validation: {
        method: 'Code review and documentation standards'
      }
    },
    {
      statement: 'Minimize CSS specificity and avoid !important',
      rationale: 'Low specificity makes CSS more maintainable and prevents cascade conflicts',
      implementation: 'Use single class selectors when possible, avoid deep nesting, use !important only for utility classes',
      validation: {
        method: 'Specificity analysis tools and code review'
      }
    }
  ],
  examples: [
    {
      language: 'css',
      title: 'BEM Naming Convention',
      goodExample: `/* Block */
.card {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
}

/* Element */
.card__header {
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.card__content {
  flex: 1;
  color: var(--color-text-secondary);
}

/* Modifier */
.card--featured {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.card--compact {
  padding: var(--spacing-sm);
}

.card__title--large {
  font-size: var(--font-size-xl);
}`,
      badExample: `/* Inconsistent naming and poor organization */
.Card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.cardHeader {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333 !important;
}

.card .content {
  flex: 1;
  color: #666;
}

.featured-card {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}`,
      explanation: 'The good example uses consistent BEM naming, CSS variables, and logical organization, while the bad example mixes naming conventions and uses hard-coded values.'
    },
    {
      language: 'css',
      title: 'CSS File Organization',
      goodExample: `/* ==========================================================================
   CSS Variables
   ========================================================================== */

:root {
  /* Colors */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  
  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

/* ==========================================================================
   Base Styles
   ========================================================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-primary);
}

/* ==========================================================================
   Layout Components
   ========================================================================== */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* ==========================================================================
   UI Components
   ========================================================================== */

.button {
  /* Positioning */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* Box Model */
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  
  /* Typography */
  font-family: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  
  /* Visual */
  background-color: var(--color-primary);
  color: white;
  cursor: pointer;
  
  /* Animation */
  transition: all 0.2s ease-in-out;
}`,
      badExample: `/* Poor organization and inconsistent structure */
.button {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
  display: inline-block;
  text-decoration: none;
  transition: background-color 0.2s;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  color: #333;
  line-height: 1.4;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

:root {
  --primary-color: #007bff;
}`,
      explanation: 'The good example has clear sections, consistent property ordering, and comprehensive variable usage, while the bad example lacks organization and structure.'
    }
  ],
  relatedGuidelines: ['html-best-practices', 'project-organization']
};