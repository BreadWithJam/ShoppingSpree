import { GuidelineEntry } from '../../types';

/**
 * Inclusive Design Guidelines
 * Inclusive design and usability guidelines for user interactions
 */

export const inclusiveDesign: GuidelineEntry = {
  id: 'accessibility-inclusive-design',
  title: 'Inclusive Design Guidelines',
  category: 'accessibility',
  priority: 'critical',
  description: 'Comprehensive guidelines for creating inclusive user experiences that accommodate diverse abilities, preferences, and contexts, ensuring websites are usable by the widest possible range of users. These usability guidelines promote inclusive design.',
  rules: [
    {
      statement: 'Design interfaces that accommodate multiple interaction methods and user preferences',
      rationale: 'Users have diverse abilities and preferences for interacting with interfaces, requiring flexible design approaches that work across different input methods.',
      implementation: 'Support both mouse and keyboard navigation, provide multiple ways to complete tasks, and offer customization options for user preferences.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['multi-modal-testing', 'user-preference-testing']
      }
    },

    {
      statement: 'Use clear, simple language that is appropriate for the intended audience',
      rationale: 'Complex language creates barriers for users with cognitive disabilities, non-native speakers, and users with varying literacy levels.',
      implementation: 'Write in plain language, define technical terms, use active voice, and provide explanations for complex concepts.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['readability-analysis', 'plain-language-review']
      }
    },

    {
      statement: 'Provide multiple ways to find and access content',
      rationale: 'Users have different mental models and search strategies, so providing multiple navigation paths improves findability for all users.',
      implementation: 'Include search functionality, site maps, breadcrumbs, category navigation, and related content links.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['navigation-testing', 'findability-analysis']
      }
    },

    {
      statement: 'Design for cognitive accessibility by reducing cognitive load',
      rationale: 'Users with cognitive disabilities, attention disorders, or those under stress benefit from interfaces that minimize mental effort required.',
      implementation: 'Use consistent layouts, clear visual hierarchy, chunked information, progress indicators, and avoid time pressures.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['cognitive-load-assessment', 'usability-testing']
      }
    },

    {
      statement: 'Ensure content and functionality work across different devices and contexts',
      rationale: 'Users access websites from various devices, network conditions, and environments, requiring responsive and adaptable designs.',
      implementation: 'Use responsive design, optimize for different screen sizes, consider offline functionality, and test across devices.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['responsive-testing', 'cross-device-testing', 'performance-testing']
      }
    },

    {
      statement: 'Provide clear feedback and error prevention mechanisms',
      rationale: 'All users benefit from clear feedback about their actions and help preventing errors, especially users with cognitive or motor impairments.',
      implementation: 'Show system status, provide confirmation messages, validate input in real-time, and offer clear error recovery options.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['error-handling-testing', 'feedback-assessment']
      }
    },

    {
      statement: 'Design forms and interactions that are forgiving and flexible',
      rationale: 'Users make mistakes and have different input patterns, so interfaces should accommodate errors and variations in user behavior.',
      implementation: 'Allow input format flexibility, provide undo functionality, save progress automatically, and offer multiple submission methods.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['form-usability-testing', 'error-recovery-testing']
      }
    }
  ],
  examples: [
    {
      language: 'html',
      title: 'Inclusive Form Design',
      goodExample: `<!-- Inclusive form with multiple accessibility features -->
<form class="inclusive-form" novalidate>
  <fieldset>
    <legend>Contact Information</legend>
    
    <!-- Flexible name input -->
    <div class="form-group">
      <label for="full-name">
        Full Name
        <span class="required" aria-label="required">*</span>
      </label>
      <input type="text" 
             id="full-name" 
             name="fullName" 
             required
             aria-describedby="name-help name-error"
             autocomplete="name"
             spellcheck="false">
      <div id="name-help" class="help-text">
        Enter your name as you'd like it to appear
      </div>
      <div id="name-error" class="error-message" role="alert" aria-live="polite"></div>
    </div>

    <!-- Flexible phone input -->
    <div class="form-group">
      <label for="phone">
        Phone Number
        <span class="optional">(optional)</span>
      </label>
      <input type="tel" 
             id="phone" 
             name="phone"
             aria-describedby="phone-help"
             autocomplete="tel"
             placeholder="Any format is fine">
      <div id="phone-help" class="help-text">
        Enter in any format: (555) 123-4567, 555-123-4567, or 5551234567
      </div>
    </div>

    <!-- Date input with multiple options -->
    <div class="form-group">
      <label for="birth-date">
        Date of Birth
        <span class="required" aria-label="required">*</span>
      </label>
      <input type="date" 
             id="birth-date" 
             name="birthDate" 
             required
             aria-describedby="date-help date-error">
      <div id="date-help" class="help-text">
        Use the date picker or type MM/DD/YYYY format
      </div>
      <div id="date-error" class="error-message" role="alert" aria-live="polite"></div>
    </div>

    <!-- Accessible file upload -->
    <div class="form-group">
      <label for="resume">
        Resume Upload
        <span class="optional">(optional)</span>
      </label>
      <input type="file" 
             id="resume" 
             name="resume"
             accept=".pdf,.doc,.docx"
             aria-describedby="file-help">
      <div id="file-help" class="help-text">
        Accepted formats: PDF, Word documents. Maximum size: 5MB
      </div>
    </div>
  </fieldset>

  <!-- Progress indicator -->
  <div class="form-progress" role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="3">
    <span class="progress-text">Step 1 of 3: Contact Information</span>
    <div class="progress-bar">
      <div class="progress-fill" style="width: 33%"></div>
    </div>
  </div>

  <!-- Multiple submission options -->
  <div class="form-actions">
    <button type="button" class="btn-secondary" onclick="saveDraft()">
      Save Draft
    </button>
    <button type="submit" class="btn-primary">
      Continue to Next Step
    </button>
  </div>

  <!-- Auto-save notification -->
  <div id="auto-save-status" aria-live="polite" class="sr-only"></div>
</form>

<script>
// Inclusive form validation
class InclusiveFormValidator {
  constructor(form) {
    this.form = form;
    this.setupValidation();
    this.setupAutoSave();
  }

  setupValidation() {
    // Real-time validation with debouncing
    this.form.addEventListener('input', this.debounce((event) => {
      this.validateField(event.target);
    }, 500));

    // Format-flexible phone validation
    const phoneInput = this.form.querySelector('#phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        this.formatPhoneNumber(phoneInput);
      });
    }
  }

  validateField(field) {
    const errorElement = document.getElementById(field.name + '-error');
    if (!errorElement) return;

    let isValid = true;
    let errorMessage = '';

    // Custom validation logic
    if (field.required && !field.value.trim()) {
      isValid = false;
      errorMessage = \`\${field.labels[0].textContent.replace('*', '').trim()} is required\`;
    } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    // Update field state
    field.setAttribute('aria-invalid', !isValid);
    errorElement.textContent = errorMessage;
    
    // Visual feedback
    field.classList.toggle('error', !isValid);
    field.classList.toggle('valid', isValid && field.value);
  }

  formatPhoneNumber(input) {
    // Accept any format, don't force specific formatting
    const value = input.value.replace(/\\D/g, '');
    if (value.length >= 10) {
      input.setCustomValidity('');
    }
  }

  setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.saveDraft();
    }, 30000);
  }

  saveDraft() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Save to localStorage
    localStorage.setItem('form-draft', JSON.stringify(data));
    
    // Announce to screen readers
    const statusElement = document.getElementById('auto-save-status');
    statusElement.textContent = 'Draft saved automatically';
    
    // Clear announcement after 3 seconds
    setTimeout(() => {
      statusElement.textContent = '';
    }, 3000);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  isValidEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  }
}
</script>`,
      badExample: `<!-- Non-inclusive form design -->
<form>
  <!-- Rigid name fields -->
  <label>First Name*</label>
  <input type="text" required pattern="[A-Za-z]+">
  
  <label>Last Name*</label>
  <input type="text" required pattern="[A-Za-z]+">
  
  <!-- Strict phone format -->
  <label>Phone* (format: 555-123-4567)</label>
  <input type="tel" required pattern="\\d{3}-\\d{3}-\\d{4}">
  
  <!-- No help text or error messages -->
  <label>Email*</label>
  <input type="email" required>
  
  <!-- Time pressure -->
  <div>Session expires in: <span id="countdown">5:00</span></div>
  
  <!-- Single submission method -->
  <button type="submit">Submit (No Going Back)</button>
</form>`,
      explanation: 'Good example accommodates different name formats, flexible input patterns, provides helpful guidance, and includes auto-save. Bad example enforces rigid patterns and creates time pressure.'
    },

    {
      language: 'html',
      title: 'Inclusive Navigation and Content Discovery',
      goodExample: `<!-- Multiple navigation methods -->
<header>
  <!-- Skip links for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#main-nav" class="skip-link">Skip to navigation</a>
  
  <!-- Search functionality -->
  <div class="search-container">
    <form role="search" aria-label="Site search">
      <label for="search-input" class="sr-only">Search</label>
      <input type="search" 
             id="search-input" 
             placeholder="Search our site..."
             aria-describedby="search-help">
      <button type="submit" aria-label="Submit search">
        <span class="icon" aria-hidden="true">🔍</span>
      </button>
    </form>
    <div id="search-help" class="help-text">
      Try searching for topics, products, or help articles
    </div>
  </div>
</header>

<!-- Primary navigation -->
<nav id="main-nav" aria-label="Main navigation">
  <ul class="nav-menu">
    <li><a href="/" aria-current="page">Home</a></li>
    <li>
      <a href="/products" aria-expanded="false" aria-haspopup="true">
        Products
      </a>
      <!-- Submenu with clear structure -->
      <ul class="submenu">
        <li><a href="/products/web-design">Web Design</a></li>
        <li><a href="/products/development">Development</a></li>
        <li><a href="/products/consulting">Consulting</a></li>
      </ul>
    </li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Web Design</li>
  </ol>
</nav>

<!-- Main content with clear structure -->
<main id="main-content">
  <article>
    <header>
      <h1>Web Design Services</h1>
      <p class="summary">
        Professional web design services that prioritize accessibility and user experience
      </p>
    </header>

    <!-- Table of contents for long content -->
    <nav class="table-of-contents" aria-labelledby="toc-heading">
      <h2 id="toc-heading">On This Page</h2>
      <ul>
        <li><a href="#overview">Overview</a></li>
        <li><a href="#services">Our Services</a></li>
        <li><a href="#process">Design Process</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#contact">Get Started</a></li>
      </ul>
    </nav>

    <!-- Content sections with clear headings -->
    <section id="overview">
      <h2>Overview</h2>
      <p>We create websites that work for everyone...</p>
    </section>

    <section id="services">
      <h2>Our Services</h2>
      <!-- Service cards with consistent structure -->
      <div class="service-grid">
        <article class="service-card">
          <h3>Responsive Design</h3>
          <p>Websites that work on all devices...</p>
          <a href="/services/responsive" class="learn-more">
            Learn more about responsive design
          </a>
        </article>
        <!-- More service cards -->
      </div>
    </section>
  </article>

  <!-- Related content -->
  <aside aria-labelledby="related-heading">
    <h2 id="related-heading">Related Resources</h2>
    <ul>
      <li><a href="/blog/accessibility-basics">Accessibility Basics</a></li>
      <li><a href="/case-studies">Design Case Studies</a></li>
      <li><a href="/resources">Design Resources</a></li>
    </ul>
  </aside>
</main>

<!-- Site map in footer -->
<footer>
  <nav aria-labelledby="footer-nav-heading">
    <h2 id="footer-nav-heading">Site Navigation</h2>
    <div class="footer-nav-grid">
      <div>
        <h3>Products</h3>
        <ul>
          <li><a href="/products/web-design">Web Design</a></li>
          <li><a href="/products/development">Development</a></li>
        </ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
  </nav>
</footer>`,
      badExample: `<!-- Limited navigation options -->
<header>
  <!-- No skip links -->
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
  <!-- No search functionality -->
</header>

<main>
  <!-- No breadcrumbs or table of contents -->
  <h1>Products</h1>
  <p>Here are our products...</p>
  <!-- Long content with no navigation aids -->
  
  <!-- No related content or alternative paths -->
</main>

<footer>
  <!-- Minimal footer with no site map -->
  <p>© 2024 Company</p>
</footer>`,
      explanation: 'Good example provides multiple ways to navigate and find content with clear structure and helpful navigation aids. Bad example offers limited navigation options.'
    },

    {
      language: 'css',
      title: 'Inclusive Visual Design and Customization',
      goodExample: `/* Inclusive visual design with user preferences */

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Support for high contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid;
  }
  
  .button {
    border: 2px solid;
    font-weight: bold;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --link-color: #66b3ff;
  }
  
  body {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
}

/* Flexible typography that scales well */
:root {
  --font-size-small: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-large: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.6;
  
  /* Ensure text remains readable when zoomed */
  max-width: none;
  overflow-x: auto;
}

/* Inclusive button design */
.button {
  /* Adequate size for all users */
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  
  /* Clear visual design */
  font-size: var(--font-size-base);
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: 4px;
  
  /* Multiple visual states */
  background-color: #0066cc;
  color: #ffffff;
  
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #0052a3;
  transform: translateY(-1px);
}

.button:focus {
  outline: 2px solid #ff6b35;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2);
}

.button:active {
  transform: translateY(0);
}

/* Disabled state with clear indication */
.button:disabled {
  background-color: #6c757d;
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Alternative button styles */
.button-secondary {
  background-color: transparent;
  color: #0066cc;
  border-color: #0066cc;
}

.button-secondary:hover {
  background-color: #0066cc;
  color: #ffffff;
}

/* Inclusive form design */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  min-height: 44px;
  padding: 0.75rem;
  font-size: var(--font-size-base);
  
  border: 2px solid #6c757d;
  border-radius: 4px;
  background-color: #ffffff;
  
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
}

.form-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.form-input.valid {
  border-color: #28a745;
  background-color: #f8fff9;
}

/* Help text and error messages */
.help-text {
  font-size: var(--font-size-small);
  color: #6c757d;
  margin-top: 0.25rem;
}

.error-message {
  font-size: var(--font-size-small);
  color: #dc3545;
  font-weight: 600;
  margin-top: 0.25rem;
}

.error-message:empty {
  display: none;
}

/* Responsive design that works at all zoom levels */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .button {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus management for modals */
.modal-open {
  overflow: hidden;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
}`,
      badExample: `/* Non-inclusive visual design */
body {
  font-size: 12px; /* Too small, fixed size */
  line-height: 1.2; /* Too tight */
  font-family: 'Fancy Font', serif; /* May not be available */
}

.button {
  height: 30px; /* Too small for touch */
  width: 80px;
  padding: 5px;
  font-size: 10px; /* Too small */
  
  background: linear-gradient(45deg, #ff0000, #00ff00); /* Poor contrast */
  color: #ffff00; /* Poor contrast with gradient */
  border: none;
}

.button:focus {
  outline: none; /* Removes focus indicator */
}

.input {
  height: 25px; /* Too small */
  padding: 3px;
  font-size: 11px;
  border: 1px solid #ccc; /* Poor contrast */
}

/* No responsive design */
.container {
  width: 1000px; /* Fixed width causes horizontal scroll */
}

/* Animations that can't be disabled */
.flashy-animation {
  animation: flash 0.1s infinite; /* Can trigger seizures */
}

@keyframes flash {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}`,
      explanation: 'Good example respects user preferences, provides adequate sizing, good contrast, and flexible design. Bad example uses fixed small sizes, poor contrast, and problematic animations.'
    }
  ],
  relatedGuidelines: [
    'accessibility-wcag-standards',
    'accessibility-interactive',
    'accessibility-visual',
    'accessibility-multimedia',
    'html-best-practices',
    'css-organization'
  ]
};