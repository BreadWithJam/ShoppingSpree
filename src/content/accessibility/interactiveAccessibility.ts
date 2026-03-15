import { GuidelineEntry } from '../../types';

/**
 * Interactive Accessibility Guidelines
 * Keyboard navigation and screen reader support requirements
 */

export const interactiveAccessibility: GuidelineEntry = {
  id: 'accessibility-interactive',
  title: 'Interactive Accessibility Guidelines',
  category: 'accessibility',
  priority: 'critical',
  description: 'Comprehensive guidelines for keyboard navigation and screen reader support to ensure all interactive elements are accessible to users with motor or visual impairments.',
  rules: [
    {
      statement: 'All interactive elements must be reachable and operable via keyboard navigation',
      rationale: 'Users with motor impairments or those who cannot use a mouse must be able to access all functionality using only the keyboard.',
      implementation: 'Ensure all buttons, links, form controls, and custom interactive elements can receive focus via Tab key and be activated via Enter or Space keys.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['keyboard-navigation-testing']
      }
    },

    {
      statement: 'Tab order must follow a logical sequence that matches the visual layout',
      rationale: 'Logical tab order helps users understand the page structure and navigate efficiently without confusion.',
      implementation: 'Use tabindex="0" for custom interactive elements, tabindex="-1" for programmatically focusable elements, and avoid positive tabindex values.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['tab-order-testing']
      }
    },

    {
      statement: 'Focus indicators must be clearly visible and meet contrast requirements',
      rationale: 'Users need to see which element currently has focus to navigate effectively, especially users with visual impairments.',
      implementation: 'Provide custom focus styles with sufficient contrast (3:1 minimum), avoid removing default focus outlines without replacement.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['focus-indicator-checker', 'contrast-analyzer']
      }
    },

    {
      statement: 'Custom interactive components must implement appropriate ARIA roles and properties',
      rationale: 'Screen readers need semantic information about custom components to announce their purpose and state to users.',
      implementation: 'Use ARIA roles (button, checkbox, tab, etc.), states (aria-expanded, aria-checked), and properties (aria-label, aria-describedby) appropriately.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['axe-core', 'ARIA-validator']
      }
    },

    {
      statement: 'Keyboard shortcuts and access keys must not conflict with assistive technology',
      rationale: 'Conflicting shortcuts can interfere with screen reader functionality and create accessibility barriers.',
      implementation: 'Avoid single-key shortcuts, use modifier keys (Ctrl, Alt) for custom shortcuts, and provide ways to disable or remap shortcuts.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['assistive-technology-testing']
      }
    },

    {
      statement: 'Dynamic content changes must be announced to screen readers',
      rationale: 'Users who cannot see the screen need to be informed when content changes dynamically.',
      implementation: 'Use ARIA live regions (aria-live, role="alert", role="status") to announce important changes and updates.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['screen-reader-testing']
      }
    },

    {
      statement: 'Modal dialogs and overlays must trap focus and provide escape mechanisms',
      rationale: 'Focus management prevents users from getting lost behind modal content and ensures they can always exit.',
      implementation: 'Move focus to modal on open, trap focus within modal, return focus to trigger element on close, provide Escape key support.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['focus-trap-testing']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Accessible Custom Button Component',
      goodExample: `// Good: Fully accessible custom button
class AccessibleButton {
  constructor(element) {
    this.element = element;
    this.setupAccessibility();
  }

  setupAccessibility() {
    // Ensure focusability
    if (!this.element.hasAttribute('tabindex')) {
      this.element.setAttribute('tabindex', '0');
    }

    // Add ARIA role if not a native button
    if (this.element.tagName !== 'BUTTON') {
      this.element.setAttribute('role', 'button');
    }

    // Keyboard event handling
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleClick();
      }
    });

    // Mouse event handling
    this.element.addEventListener('click', () => {
      this.handleClick();
    });
  }

  handleClick() {
    // Button action logic
    console.log('Button activated');
    
    // Update ARIA state if needed
    const pressed = this.element.getAttribute('aria-pressed') === 'true';
    this.element.setAttribute('aria-pressed', (!pressed).toString());
  }
}

// CSS for focus indicator
.custom-button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.2);
}`,
      badExample: `// Bad: Inaccessible custom button
<div class="button" onclick="doSomething()">
  Click me
</div>

<style>
.button:focus {
  outline: none; /* Removes focus indicator */
}
</style>

<script>
function doSomething() {
  console.log('Button clicked');
  // No keyboard support, no ARIA attributes
}
</script>`,
      explanation: 'The good example provides full keyboard support, proper ARIA attributes, and visible focus indicators. The bad example lacks keyboard accessibility and removes focus indicators.'
    },

    {
      language: 'javascript',
      title: 'Accessible Modal Dialog with Focus Management',
      goodExample: `class AccessibleModal {
  constructor(modalElement, triggerElement) {
    this.modal = modalElement;
    this.trigger = triggerElement;
    this.focusableElements = [];
    this.previousFocus = null;
    
    this.setupModal();
  }

  setupModal() {
    // Set ARIA attributes
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'modal-title');
    
    // Find focusable elements
    this.updateFocusableElements();
    
    // Event listeners
    this.modal.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Close button
    const closeBtn = this.modal.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  open() {
    // Store current focus
    this.previousFocus = document.activeElement;
    
    // Show modal
    this.modal.style.display = 'block';
    this.modal.removeAttribute('aria-hidden');
    
    // Focus first focusable element or modal itself
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    } else {
      this.modal.focus();
    }
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  close() {
    // Hide modal
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    
    // Restore scrolling
    document.body.style.overflow = '';
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  trapFocus(event) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelectors)
    );
  }
}`,
      badExample: `// Bad: Modal without focus management
function showModal() {
  document.getElementById('modal').style.display = 'block';
  // No focus management, no keyboard support
}

function hideModal() {
  document.getElementById('modal').style.display = 'none';
  // Focus not returned to trigger
}

// No escape key support, no focus trapping`,
      explanation: 'The good example implements proper focus management, keyboard navigation, and ARIA attributes. The bad example lacks focus trapping and keyboard support.'
    },

    {
      language: 'javascript',
      title: 'ARIA Live Regions for Dynamic Content',
      goodExample: `// Good: Accessible dynamic content updates
class AccessibleNotifications {
  constructor() {
    this.setupLiveRegions();
  }

  setupLiveRegions() {
    // Create live regions if they don't exist
    if (!document.getElementById('announcements')) {
      const announcements = document.createElement('div');
      announcements.id = 'announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.className = 'sr-only';
      document.body.appendChild(announcements);
    }

    if (!document.getElementById('alerts')) {
      const alerts = document.createElement('div');
      alerts.id = 'alerts';
      alerts.setAttribute('role', 'alert');
      alerts.setAttribute('aria-atomic', 'true');
      alerts.className = 'sr-only';
      document.body.appendChild(alerts);
    }
  }

  announce(message, priority = 'polite') {
    const region = priority === 'assertive' ? 
      document.getElementById('alerts') : 
      document.getElementById('announcements');
    
    // Clear previous message
    region.textContent = '';
    
    // Add new message after a brief delay to ensure it's announced
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 5000);
  }

  // Usage examples
  showSuccessMessage(message) {
    this.announce(\`Success: \${message}\`, 'polite');
  }

  showErrorMessage(message) {
    this.announce(\`Error: \${message}\`, 'assertive');
  }

  updateStatus(status) {
    this.announce(\`Status updated to: \${status}\`, 'polite');
  }
}

// CSS for screen reader only content
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
}`,
      badExample: `// Bad: No screen reader announcements
function showMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = 'message';
  document.body.appendChild(messageDiv);
  
  // Visual users see the message, but screen reader users don't know about it
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

function updateCounter(count) {
  document.getElementById('counter').textContent = count;
  // Counter updates visually but screen readers aren't notified
}`,
      explanation: 'The good example uses ARIA live regions to announce dynamic changes to screen reader users. The bad example only provides visual feedback.'
    },

    {
      language: 'html',
      title: 'Accessible Dropdown Menu with Keyboard Navigation',
      goodExample: `<nav role="navigation" aria-label="Main menu">
  <ul class="menu">
    <li>
      <button type="button" 
              aria-expanded="false" 
              aria-haspopup="true"
              aria-controls="submenu-1"
              class="menu-trigger">
        Products
      </button>
      <ul id="submenu-1" class="submenu" aria-hidden="true">
        <li><a href="/product-1">Product 1</a></li>
        <li><a href="/product-2">Product 2</a></li>
        <li><a href="/product-3">Product 3</a></li>
      </ul>
    </li>
  </ul>
</nav>

<script>
class AccessibleDropdown {
  constructor(trigger) {
    this.trigger = trigger;
    this.menu = document.getElementById(trigger.getAttribute('aria-controls'));
    this.menuItems = this.menu.querySelectorAll('a');
    this.isOpen = false;
    
    this.setupEvents();
  }

  setupEvents() {
    // Trigger events
    this.trigger.addEventListener('click', () => this.toggle());
    this.trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
    
    // Menu item events
    this.menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => this.handleMenuKeydown(e, index));
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.removeAttribute('aria-hidden');
    this.menuItems[0].focus();
  }

  close() {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    this.trigger.focus();
  }

  handleTriggerKeydown(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  handleMenuKeydown(event, currentIndex) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % this.menuItems.length;
        this.menuItems[nextIndex].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? this.menuItems.length - 1 : currentIndex - 1;
        this.menuItems[prevIndex].focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }
}
</script>`,
      badExample: `<!-- Bad: Dropdown without keyboard support -->
<div class="dropdown">
  <div class="dropdown-trigger" onclick="toggleDropdown()">
    Products
  </div>
  <div class="dropdown-menu" id="dropdown">
    <a href="/product-1">Product 1</a>
    <a href="/product-2">Product 2</a>
  </div>
</div>

<script>
function toggleDropdown() {
  const menu = document.getElementById('dropdown');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  // No keyboard support, no ARIA attributes, no focus management
}
</script>`,
      explanation: 'The good example provides full keyboard navigation, proper ARIA attributes, and focus management. The bad example is only accessible via mouse.'
    }
  ],
  relatedGuidelines: [
    'accessibility-wcag-standards',
    'accessibility-visual',
    'html-best-practices'
  ]
};