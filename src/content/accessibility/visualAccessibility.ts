import { GuidelineEntry } from '../../types';

/**
 * Visual Accessibility Guidelines
 * Color contrast and text readability requirements
 */

export const visualAccessibility: GuidelineEntry = {
  id: 'accessibility-visual',
  title: 'Visual Accessibility Guidelines',
  category: 'accessibility',
  priority: 'critical',
  description: 'Comprehensive guidelines for color contrast, text readability, and visual design accessibility to ensure content is perceivable by users with visual impairments.',
  rules: [
    {
      statement: 'Text must meet minimum color contrast ratios against background colors',
      rationale: 'Sufficient contrast ensures text is readable for users with visual impairments, color blindness, or in various lighting conditions.',
      implementation: 'Normal text requires 4.5:1 contrast ratio, large text (18pt+ or 14pt+ bold) requires 3:1 ratio. Use contrast checking tools during design.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['contrast-checker', 'axe-core', 'WAVE']
      }
    },

    {
      statement: 'Color must not be the sole method of conveying information or indicating actions',
      rationale: 'Users with color blindness cannot distinguish certain color combinations, so information must be available through other visual means.',
      implementation: 'Supplement color with text labels, icons, patterns, shapes, or other visual indicators. Use multiple visual cues for important information.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['color-blindness-simulator', 'manual-review']
      }
    },

    {
      statement: 'Text must be resizable up to 200% without loss of functionality or content',
      rationale: 'Users with visual impairments need to be able to enlarge text to read it comfortably without horizontal scrolling or content overlap.',
      implementation: 'Use relative units (em, rem, %) for font sizes and responsive design techniques. Test zoom functionality across browsers.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['browser-zoom-testing']
      }
    },

    {
      statement: 'Interactive elements must have sufficient size and spacing for easy targeting',
      rationale: 'Users with motor impairments or those using touch devices need adequately sized targets to interact successfully.',
      implementation: 'Ensure interactive elements are at least 44x44 pixels (CSS pixels) with adequate spacing between adjacent targets.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['target-size-checker', 'touch-accessibility-audit']
      }
    },

    {
      statement: 'Focus indicators must be clearly visible and meet contrast requirements',
      rationale: 'Users navigating with keyboards need to see which element currently has focus to navigate effectively.',
      implementation: 'Provide focus indicators with at least 3:1 contrast ratio against adjacent colors. Use outline, border, or background changes.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['focus-indicator-checker', 'keyboard-navigation-audit']
      }
    },

    {
      statement: 'Content must not cause seizures through flashing or rapid transitions',
      rationale: 'Flashing content can trigger seizures in users with photosensitive epilepsy.',
      implementation: 'Avoid content that flashes more than 3 times per second. Provide controls to pause, stop, or hide moving content.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['seizure-risk-analyzer', 'manual-review']
      }
    },

    {
      statement: 'Visual layout must maintain meaning and functionality when CSS is disabled',
      rationale: 'Some users may disable CSS or use assistive technologies that ignore styling, so content structure must remain logical.',
      implementation: 'Use semantic HTML structure that makes sense without styling. Ensure reading order follows logical document flow.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['css-disabled-testing', 'linearization-testing']
      }
    }
  ],
  examples: [
    {
      language: 'css',
      title: 'Accessible Color Contrast Implementation',
      goodExample: `/* Good: High contrast color combinations */
.primary-text {
  color: #212529; /* Dark gray */
  background-color: #ffffff; /* White */
  /* Contrast ratio: 16.75:1 (exceeds 4.5:1 requirement) */
}

.secondary-text {
  color: #495057; /* Medium gray */
  background-color: #f8f9fa; /* Light gray */
  /* Contrast ratio: 7.0:1 (exceeds 4.5:1 requirement) */
}

.large-text {
  font-size: 1.25rem; /* 20px */
  font-weight: bold;
  color: #6c757d; /* Light gray */
  background-color: #ffffff; /* White */
  /* Contrast ratio: 4.5:1 (meets 3:1 requirement for large text) */
}

.error-message {
  color: #721c24; /* Dark red */
  background-color: #f8d7da; /* Light red */
  border: 2px solid #f5c6cb; /* Red border */
  /* Uses color + border + icon for error indication */
}

.error-message::before {
  content: "⚠ "; /* Warning icon supplements color */
}

/* Success state with multiple indicators */
.success-message {
  color: #155724; /* Dark green */
  background-color: #d4edda; /* Light green */
  border-left: 4px solid #28a745; /* Green border */
}

.success-message::before {
  content: "✓ "; /* Checkmark supplements color */
}`,
      badExample: `/* Bad: Poor contrast and color-only indicators */
.primary-text {
  color: #999999; /* Light gray */
  background-color: #ffffff; /* White */
  /* Contrast ratio: 2.85:1 (fails 4.5:1 requirement) */
}

.error-text {
  color: #ff6b6b; /* Light red */
  background-color: #ffffff; /* White */
  /* Contrast ratio: 3.2:1 (fails 4.5:1 requirement) */
  /* Only uses color to indicate error */
}

.link-text {
  color: #87ceeb; /* Sky blue */
  background-color: #ffffff; /* White */
  /* Contrast ratio: 1.6:1 (severely fails requirements) */
}

.disabled-button {
  color: #cccccc; /* Very light gray */
  background-color: #f0f0f0; /* Very light gray */
  /* Contrast ratio: 1.2:1 (fails all requirements) */
}`,
      explanation: 'Good examples meet or exceed contrast requirements and use multiple visual indicators. Bad examples fail contrast requirements and rely solely on color.'
    },

    {
      language: 'css',
      title: 'Responsive Text and Scalable Design',
      goodExample: `/* Good: Scalable typography and layout */
html {
  font-size: 16px; /* Base font size */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5; /* Adequate line spacing */
  font-size: 1rem; /* Relative to root font size */
}

h1 {
  font-size: 2.5rem; /* 40px at default size, scales with zoom */
  line-height: 1.2;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem; /* 32px at default size */
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

p {
  font-size: 1rem; /* 16px at default size */
  line-height: 1.6; /* Good readability */
  margin-bottom: 1rem;
  max-width: 70ch; /* Optimal reading line length */
}

.large-text {
  font-size: 1.25rem; /* 20px, qualifies as large text */
  font-weight: 600;
}

/* Responsive breakpoints using relative units */
@media (max-width: 48rem) { /* 768px */
  h1 {
    font-size: 2rem; /* Smaller on mobile but still scalable */
  }
  
  body {
    font-size: 1rem; /* Maintains readability */
  }
}

/* Focus indicators that scale with zoom */
button:focus,
a:focus {
  outline: 0.125rem solid #0066cc; /* 2px, scales with zoom */
  outline-offset: 0.125rem; /* 2px offset */
  box-shadow: 0 0 0 0.25rem rgba(0, 102, 204, 0.2); /* 4px shadow */
}`,
      badExample: `/* Bad: Fixed sizes that don't scale */
body {
  font-size: 14px; /* Fixed pixel size, doesn't scale well */
  line-height: 1.2; /* Too tight for readability */
}

h1 {
  font-size: 24px; /* Fixed size, won't scale with user preferences */
}

p {
  font-size: 12px; /* Too small, fixed size */
  line-height: 1.1; /* Insufficient line spacing */
  width: 800px; /* Fixed width, causes horizontal scroll when zoomed */
}

.small-text {
  font-size: 10px; /* Too small to be accessible */
}

/* Focus indicator that disappears when zoomed */
button:focus {
  outline: 1px dotted gray; /* Too thin, poor contrast */
}`,
      explanation: 'Good examples use relative units that scale with user preferences and browser zoom. Bad examples use fixed pixel sizes that create accessibility barriers.'
    },

    {
      language: 'css',
      title: 'Accessible Interactive Element Sizing',
      goodExample: `/* Good: Adequately sized interactive elements */
button {
  min-height: 44px; /* Meets minimum touch target size */
  min-width: 44px;
  padding: 0.75rem 1.5rem; /* Adequate padding */
  margin: 0.25rem; /* Spacing between adjacent buttons */
  
  font-size: 1rem;
  line-height: 1.2;
  
  border: 2px solid #0066cc;
  background-color: #0066cc;
  color: #ffffff;
  
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #0052a3;
  border-color: #0052a3;
}

button:focus {
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
}

/* Link buttons with adequate sizing */
.link-button {
  display: inline-block;
  min-height: 44px;
  padding: 0.75rem 1rem;
  text-decoration: none;
  
  /* Ensure text is vertically centered */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form inputs with proper sizing */
input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  min-height: 44px;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #6c757d;
  margin-bottom: 1rem;
}

/* Checkbox and radio with larger click areas */
.checkbox-wrapper,
.radio-wrapper {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0.5rem;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"],
.radio-wrapper input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
}`,
      badExample: `/* Bad: Inadequately sized interactive elements */
button {
  height: 24px; /* Too small for touch targets */
  width: 60px;
  padding: 2px 8px; /* Insufficient padding */
  margin: 1px; /* No spacing between elements */
  
  font-size: 11px; /* Too small */
  border: 1px solid #ccc;
}

.small-link {
  font-size: 10px; /* Too small to click easily */
  padding: 2px; /* Insufficient click area */
}

input {
  height: 20px; /* Too small */
  padding: 2px; /* Insufficient padding */
  font-size: 10px; /* Too small */
}

/* Checkboxes too small and close together */
input[type="checkbox"] {
  width: 12px;
  height: 12px;
  margin: 2px; /* No adequate spacing */
}`,
      explanation: 'Good examples provide adequate sizing for all interactive elements with proper spacing. Bad examples create targets that are difficult to use, especially on touch devices.'
    },

    {
      language: 'html',
      title: 'Non-Color Information Indicators',
      goodExample: `<!-- Good: Multiple visual indicators beyond color -->
<div class="status-indicators">
  <!-- Success state with icon, text, and color -->
  <div class="alert alert-success" role="alert">
    <span class="icon" aria-hidden="true">✓</span>
    <strong>Success:</strong> Your changes have been saved.
  </div>

  <!-- Error state with icon, text, and color -->
  <div class="alert alert-error" role="alert">
    <span class="icon" aria-hidden="true">⚠</span>
    <strong>Error:</strong> Please correct the following issues.
  </div>

  <!-- Warning with multiple indicators -->
  <div class="alert alert-warning" role="alert">
    <span class="icon" aria-hidden="true">!</span>
    <strong>Warning:</strong> This action cannot be undone.
  </div>
</div>

<!-- Form validation with multiple indicators -->
<form>
  <div class="form-group">
    <label for="email">Email Address *</label>
    <input type="email" 
           id="email" 
           class="form-control error" 
           aria-describedby="email-error"
           aria-invalid="true">
    <div id="email-error" class="error-message" role="alert">
      <span class="error-icon" aria-hidden="true">⚠</span>
      Please enter a valid email address
    </div>
  </div>

  <!-- Required field indicators -->
  <div class="form-group">
    <label for="name">
      Full Name 
      <span class="required" aria-label="required">*</span>
    </label>
    <input type="text" id="name" class="form-control" required>
  </div>
</form>

<!-- Progress indicator with text and visual bar -->
<div class="progress-container">
  <div class="progress-label">Upload Progress: 75% Complete</div>
  <div class="progress-bar" role="progressbar" 
       aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
</div>

<style>
.alert {
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left-color: #28a745;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border-left-color: #dc3545;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border-left-color: #ffc107;
}

.form-control.error {
  border: 2px solid #dc3545;
  background-color: #fff5f5;
}

.required {
  color: #dc3545;
  font-weight: bold;
}
</style>`,
      badExample: `<!-- Bad: Color-only indicators -->
<div class="status-messages">
  <!-- Only uses color to indicate success -->
  <div style="color: green;">Changes saved</div>
  
  <!-- Only uses color to indicate error -->
  <div style="color: red;">Error occurred</div>
  
  <!-- Only uses color to indicate warning -->
  <div style="color: orange;">Warning message</div>
</div>

<!-- Form with color-only validation -->
<form>
  <label>Email</label>
  <input type="email" style="border: 2px solid red;">
  <!-- Error indicated only by red border -->
  
  <label style="color: red;">Password</label>
  <!-- Required field indicated only by red color -->
  <input type="password">
</form>

<!-- Progress bar with no text indicator -->
<div class="progress" style="background: lightgray;">
  <div style="width: 50%; background: blue; height: 20px;"></div>
  <!-- Progress only shown visually, no text alternative -->
</div>`,
      explanation: 'Good examples use icons, text labels, borders, and patterns in addition to color. Bad examples rely solely on color, making them inaccessible to colorblind users.'
    }
  ],
  relatedGuidelines: [
    'accessibility-wcag-standards',
    'accessibility-interactive',
    'css-organization',
    'html-best-practices'
  ]
};