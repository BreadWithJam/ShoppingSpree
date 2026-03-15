import { GuidelineEntry } from '../../types';

/**
 * WCAG Accessibility Standards Guidelines
 * Comprehensive WCAG compliance rules for HTML elements
 */

export const wcagStandards: GuidelineEntry = {
  id: 'accessibility-wcag-standards',
  title: 'WCAG Accessibility Standards',
  category: 'accessibility',
  priority: 'critical',
  description: 'Comprehensive guidelines for implementing WCAG 2.1 AA compliance standards for HTML elements, ensuring websites are accessible to users with disabilities. These WCAG standards provide the foundation for web accessibility.',
  rules: [
    {
      statement: 'All images must have appropriate alternative text or be marked as decorative',
      rationale: 'Screen readers rely on alt text to convey image content to visually impaired users. Decorative images should be marked to avoid unnecessary announcements.',
      implementation: 'Use descriptive alt attributes for informative images, empty alt="" for decorative images, and consider using aria-labelledby for complex images.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['axe-core', 'WAVE', 'lighthouse-accessibility']
      }
    },

    {
      statement: 'All interactive elements must be keyboard accessible with visible focus indicators',
      rationale: 'Users who cannot use a mouse must be able to navigate and interact with all functionality using only the keyboard.',
      implementation: 'Ensure all interactive elements can receive focus via Tab key, provide custom focus styles, and implement logical tab order.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['keyboard-navigation-testing']
      }
    },

    {
      statement: 'Color must not be the only means of conveying information',
      rationale: 'Users with color blindness or visual impairments may not be able to distinguish colors, so information must be conveyed through other means.',
      implementation: 'Use text labels, icons, patterns, or other visual indicators in addition to color to convey meaning.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['color-contrast-analyzer', 'colorblinding-simulator']
      }
    },

    {
      statement: 'Text must meet minimum color contrast ratios (4.5:1 for normal text, 3:1 for large text)',
      rationale: 'Sufficient contrast ensures text is readable for users with visual impairments or in various lighting conditions.',
      implementation: 'Test color combinations using contrast checking tools and adjust colors to meet WCAG AA standards.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['contrast-checker', 'axe-core']
      }
    },

    {
      statement: 'All form inputs must have associated labels or accessible names',
      rationale: 'Screen readers need labels to identify form controls and their purpose to users.',
      implementation: 'Use <label> elements with for/id attributes, aria-label, or aria-labelledby to provide accessible names for all form controls.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['axe-core', 'form-accessibility-checker']
      }
    },

    {
      statement: 'Headings must follow a logical hierarchy without skipping levels',
      rationale: 'Screen reader users rely on heading structure to navigate and understand content organization.',
      implementation: 'Use h1 for page title, h2 for main sections, h3 for subsections, etc. Do not skip heading levels for styling purposes.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['heading-structure-checker', 'axe-core']
      }
    },

    {
      statement: 'All content must be accessible without requiring specific sensory abilities',
      rationale: 'Content should not rely solely on sensory characteristics like shape, size, visual location, orientation, or sound.',
      implementation: 'Provide text alternatives for audio content, avoid instructions that rely only on visual or auditory cues.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['manual-accessibility-review']
      }
    }
  ],
  examples: [
    {
      language: 'html',
      title: 'Accessible Image Implementation',
      goodExample: `<!-- Informative image with descriptive alt text -->
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2 2024, rising from $100k to $125k">

<!-- Decorative image marked appropriately -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- Complex image with detailed description -->
<img src="complex-chart.png" alt="Quarterly sales data" aria-describedby="chart-description">
<div id="chart-description">
  <h3>Detailed Chart Description</h3>
  <p>This bar chart shows quarterly sales data for 2024...</p>
</div>

<!-- Image used as a button -->
<button type="button" aria-label="Close dialog">
  <img src="close-icon.svg" alt="" role="presentation">
</button>`,
      badExample: `<!-- Missing alt text -->
<img src="chart.png">

<!-- Redundant or poor alt text -->
<img src="chart.png" alt="chart.png">
<img src="sales-chart.png" alt="image">

<!-- Decorative image with unnecessary alt text -->
<img src="decorative-border.png" alt="decorative border image">`,
      explanation: 'Good examples provide meaningful alt text for informative images, mark decorative images appropriately, and use aria-describedby for complex content. Bad examples lack alt text or provide redundant/meaningless descriptions.'
    },

    {
      language: 'html',
      title: 'Keyboard Accessible Interactive Elements',
      goodExample: `<!-- Properly focusable button with visible focus -->
<button type="button" class="custom-button" onclick="toggleMenu()">
  Menu
</button>

<style>
.custom-button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
</style>

<!-- Custom interactive element with proper ARIA -->
<div role="button" tabindex="0" aria-pressed="false" 
     onkeydown="handleKeyDown(event)" onclick="toggleState()">
  Toggle Option
</div>

<script>
function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleState();
  }
}
</script>

<!-- Skip link for keyboard navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>`,
      badExample: `<!-- Non-focusable interactive element -->
<div onclick="toggleMenu()">Menu</div>

<!-- Button without visible focus indicator -->
<button type="button" style="outline: none;" onclick="toggleMenu()">
  Menu
</button>

<!-- Custom element without keyboard support -->
<div class="clickable" onclick="doSomething()">
  Click me
</div>`,
      explanation: 'Good examples ensure all interactive elements are keyboard accessible with proper focus management and ARIA attributes. Bad examples create keyboard traps or inaccessible interactions.'
    },

    {
      language: 'html',
      title: 'Accessible Form Labels and Structure',
      goodExample: `<form>
  <!-- Explicit label association -->
  <label for="username">Username (required)</label>
  <input type="text" id="username" name="username" required 
         aria-describedby="username-help">
  <div id="username-help">Must be 3-20 characters long</div>

  <!-- Implicit label association -->
  <label>
    Email Address (required)
    <input type="email" name="email" required>
  </label>

  <!-- Grouped radio buttons -->
  <fieldset>
    <legend>Preferred Contact Method</legend>
    <label>
      <input type="radio" name="contact" value="email" checked>
      Email
    </label>
    <label>
      <input type="radio" name="contact" value="phone">
      Phone
    </label>
  </fieldset>

  <!-- Error message association -->
  <label for="password">Password</label>
  <input type="password" id="password" name="password" 
         aria-describedby="password-error" aria-invalid="true">
  <div id="password-error" role="alert">
    Password must contain at least 8 characters
  </div>
</form>`,
      badExample: `<form>
  <!-- Missing label -->
  <input type="text" name="username" placeholder="Username">

  <!-- Label not associated with input -->
  <div>Email Address</div>
  <input type="email" name="email">

  <!-- Ungrouped radio buttons -->
  <div>Preferred Contact Method</div>
  <input type="radio" name="contact" value="email"> Email
  <input type="radio" name="contact" value="phone"> Phone

  <!-- Inaccessible error message -->
  <input type="password" name="password">
  <div style="color: red;">Invalid password</div>
</form>`,
      explanation: 'Good examples properly associate labels with inputs, group related elements, and make error messages accessible. Bad examples lack proper labeling and structure.'
    },

    {
      language: 'html',
      title: 'Proper Heading Structure',
      goodExample: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Article: Web Accessibility Guide</title>
</head>
<body>
  <header>
    <h1>Web Accessibility Guide</h1>
    <nav aria-label="Main navigation">
      <!-- Navigation content -->
    </nav>
  </header>

  <main>
    <article>
      <h2>Introduction to WCAG</h2>
      <p>Content about WCAG...</p>

      <h3>WCAG Principles</h3>
      <p>The four main principles...</p>

      <h4>Perceivable</h4>
      <p>Information must be presentable...</p>

      <h4>Operable</h4>
      <p>Interface components must be operable...</p>

      <h3>Implementation Guidelines</h3>
      <p>How to implement WCAG...</p>
    </article>

    <aside>
      <h2>Related Resources</h2>
      <h3>Tools</h3>
      <ul>
        <li>Accessibility testing tools</li>
      </ul>
    </aside>
  </main>
</body>
</html>`,
      badExample: `<!DOCTYPE html>
<html>
<body>
  <h3>Web Accessibility Guide</h3>
  
  <h1>Introduction to WCAG</h1>
  <p>Content about WCAG...</p>

  <h4>WCAG Principles</h4>
  <p>The four main principles...</p>

  <h2>Perceivable</h2>
  <p>Information must be presentable...</p>

  <h2>Operable</h2>
  <p>Interface components must be operable...</p>

  <h1>Implementation Guidelines</h1>
  <p>How to implement WCAG...</p>
</body>
</html>`,
      explanation: 'Good example follows logical heading hierarchy (h1 → h2 → h3 → h4) and uses semantic HTML structure. Bad example skips heading levels and uses headings inconsistently.'
    }
  ],
  relatedGuidelines: [
    'accessibility-interactive',
    'accessibility-visual',
    'accessibility-multimedia',
    'html-best-practices'
  ]
};