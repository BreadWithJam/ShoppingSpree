/**
 * Accessibility Manager Module
 * Handles accessibility features, ARIA updates, and keyboard navigation
 */

import { BaseModule } from './base-module.js';

export class AccessibilityManager extends BaseModule {
  constructor() {
    super('AccessibilityManager');
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.announcements = [];
  }

  /**
   * Find accessibility elements
   */
  async findElements() {
    this.setElement('skipLink', this.findElement('.skip-link'));
    this.setElement('mainContent', this.findElement('#main-content'));
    this.setElement('liveRegions', this.findElements('[aria-live]'));
    this.setElement('focusableElements', this.findFocusableElements());
  }

  /**
   * Initialize accessibility features
   */
  async init() {
    await super.init();
    
    // Set up focus management
    this.setupFocusManagement();
    
    // Set up keyboard navigation
    this.setupKeyboardNavigation();
    
    // Set up screen reader announcements
    this.setupScreenReaderSupport();
    
    // Monitor for dynamic content changes
    this.setupContentObserver();
  }

  /**
   * Bind accessibility events
   */
  bindEvents() {
    // Skip link functionality
    const skipLink = this.getElement('skipLink');
    if (skipLink) {
      this.addEventListener(skipLink, 'click', this.handleSkipLinkClick);
    }

    // Global keyboard navigation
    this.addEventListener(document, 'keydown', this.handleGlobalKeydown);
    
    // Focus management
    this.addEventListener(document, 'focusin', this.handleFocusIn);
    this.addEventListener(document, 'focusout', this.handleFocusOut);
    
    // Listen for dynamic content updates
    this.addEventListener(document, 'contentUpdated', this.handleContentUpdated);
    
    // Listen for cart updates for announcements
    this.addEventListener(document, 'cartUpdated', this.handleCartUpdated);
  }

  /**
   * Handle skip link clicks
   */
  handleSkipLinkClick(event) {
    event.preventDefault();
    
    const mainContent = this.getElement('mainContent');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Handle global keyboard navigation
   */
  handleGlobalKeydown(event) {
    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivationKeys(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowKeys(event);
        break;
    }
  }

  /**
   * Handle tab navigation
   */
  handleTabNavigation(event) {
    const focusableElements = this.findFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement);
    
    // Update focus index
    if (event.shiftKey) {
      this.currentFocusIndex = currentIndex - 1;
    } else {
      this.currentFocusIndex = currentIndex + 1;
    }
    
    // Ensure focus stays within bounds
    if (this.currentFocusIndex < 0) {
      this.currentFocusIndex = focusableElements.length - 1;
    } else if (this.currentFocusIndex >= focusableElements.length) {
      this.currentFocusIndex = 0;
    }
  }

  /**
   * Handle escape key
   */
  handleEscapeKey(event) {
    // Close any open dropdowns or modals
    const openDropdowns = document.querySelectorAll('.cart-dropdown--visible, .search-suggestions:not([hidden])');
    
    openDropdowns.forEach(dropdown => {
      if (dropdown.classList.contains('cart-dropdown--visible')) {
        dropdown.classList.remove('cart-dropdown--visible');
      } else {
        dropdown.hidden = true;
      }
    });
    
    // Return focus to appropriate element
    if (openDropdowns.length > 0) {
      event.preventDefault();
      this.returnFocusToTrigger();
    }
  }

  /**
   * Handle activation keys (Enter/Space)
   */
  handleActivationKeys(event) {
    const target = event.target;
    
    // Handle custom interactive elements
    if (target.hasAttribute('role')) {
      const role = target.getAttribute('role');
      
      if (role === 'button' && !target.disabled) {
        event.preventDefault();
        target.click();
      }
    }
  }

  /**
   * Handle arrow key navigation
   */
  handleArrowKeys(event) {
    const target = event.target;
    const parent = target.closest('[role="listbox"], [role="menu"], [role="tablist"]');
    
    if (parent) {
      event.preventDefault();
      this.handleArrowNavigation(parent, event.key);
    }
  }

  /**
   * Handle arrow navigation within containers
   */
  handleArrowNavigation(container, key) {
    const items = container.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]');
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    let newIndex = currentIndex;
    
    switch (key) {
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    if (items[newIndex]) {
      items[newIndex].focus();
    }
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(event) {
    const target = event.target;
    
    // Add focus indicator class
    target.classList.add('focused');
    
    // Update ARIA attributes if needed
    this.updateAriaAttributes(target);
    
    // Announce focus changes for screen readers
    this.announceFocusChange(target);
  }

  /**
   * Handle focus out events
   */
  handleFocusOut(event) {
    const target = event.target;
    
    // Remove focus indicator class
    target.classList.remove('focused');
  }

  /**
   * Handle content updates
   */
  handleContentUpdated(event) {
    const { type } = event.detail;
    
    // Update focusable elements list
    this.setElement('focusableElements', this.findFocusableElements());
    
    // Announce content changes
    if (type === 'added') {
      this.announceToScreenReader('New content added to the page');
    } else if (type === 'removed') {
      this.announceToScreenReader('Content removed from the page');
    }
  }

  /**
   * Handle cart updates for accessibility announcements
   */
  handleCartUpdated(event) {
    const { action, product } = event.detail;
    
    let message = '';
    
    switch (action) {
      case 'add':
        message = `Added ${product.name} to cart`;
        break;
      case 'remove':
        message = 'Removed item from cart';
        break;
      case 'update':
        message = 'Updated cart item quantity';
        break;
      case 'clear':
        message = 'Cart cleared';
        break;
    }
    
    if (message) {
      this.announceToScreenReader(message);
    }
  }

  /**
   * Find all focusable elements
   */
  findFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]'
    ].join(', ');
    
    return Array.from(document.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hidden &&
               window.getComputedStyle(element).visibility !== 'hidden';
      });
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Ensure all interactive elements have proper focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .focused,
      *:focus {
        outline: 2px solid var(--color-focus, #0066cc) !important;
        outline-offset: 2px !important;
      }
      
      .focused.button,
      button:focus {
        outline-color: var(--color-text-inverse, #ffffff) !important;
      }
      
      .skip-link:focus {
        outline-color: var(--color-text-inverse, #ffffff) !important;
      }
    `;
    
    if (!document.getElementById('accessibility-focus-styles')) {
      style.id = 'accessibility-focus-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    // Add keyboard navigation hints
    const keyboardHints = document.createElement('div');
    keyboardHints.id = 'keyboard-hints';
    keyboardHints.className = 'visually-hidden';
    keyboardHints.innerHTML = `
      <p>Use Tab to navigate, Enter or Space to activate, Escape to close dialogs</p>
    `;
    
    document.body.appendChild(keyboardHints);
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Create live region for announcements
    let liveRegion = document.getElementById('sr-announcements');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }
    
    this.setElement('liveRegion', liveRegion);
  }

  /**
   * Setup content observer for dynamic changes
   */
  setupContentObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Update focusable elements when DOM changes
          this.setElement('focusableElements', this.findFocusableElements());
          
          // Check for new interactive elements that need accessibility attributes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.enhanceAccessibility(node);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance accessibility for new elements
   */
  enhanceAccessibility(element) {
    // Add ARIA labels to buttons without text
    const buttons = element.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        const icon = button.querySelector('svg, img');
        if (icon) {
          button.setAttribute('aria-label', 'Button');
        }
      }
    });
    
    // Add alt text to images without it
    const images = element.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      img.setAttribute('alt', '');
    });
    
    // Ensure form inputs have labels
    const inputs = element.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const label = element.querySelector(`label[for="${input.id}"]`);
      if (!label && input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });
  }

  /**
   * Update ARIA attributes based on state
   */
  updateAriaAttributes(element) {
    // Update expanded state for dropdowns
    if (element.hasAttribute('aria-expanded')) {
      const isExpanded = element.getAttribute('aria-expanded') === 'true';
      const target = document.querySelector(`#${element.getAttribute('aria-controls')}`);
      
      if (target) {
        target.setAttribute('aria-hidden', (!isExpanded).toString());
      }
    }
    
    // Update selected state for options
    if (element.hasAttribute('role') && element.getAttribute('role') === 'option') {
      const parent = element.closest('[role="listbox"]');
      if (parent) {
        const options = parent.querySelectorAll('[role="option"]');
        options.forEach(option => {
          option.setAttribute('aria-selected', (option === element).toString());
        });
      }
    }
  }

  /**
   * Announce focus changes
   */
  announceFocusChange(element) {
    let announcement = '';
    
    // Get element description
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('aria-labelledby') ||
                  element.textContent.trim();
    
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    
    if (label) {
      announcement = `${label}, ${role}`;
      
      // Add state information
      if (element.hasAttribute('aria-expanded')) {
        const expanded = element.getAttribute('aria-expanded') === 'true';
        announcement += expanded ? ', expanded' : ', collapsed';
      }
      
      if (element.hasAttribute('aria-selected')) {
        const selected = element.getAttribute('aria-selected') === 'true';
        announcement += selected ? ', selected' : ', not selected';
      }
      
      if (element.disabled) {
        announcement += ', disabled';
      }
    }
    
    // Don't announce every focus change, only significant ones
    if (this.shouldAnnounceFocus(element)) {
      this.announceToScreenReader(announcement, 'assertive');
    }
  }

  /**
   * Determine if focus change should be announced
   */
  shouldAnnounceFocus(element) {
    const significantRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    
    return significantRoles.includes(role) || 
           element.hasAttribute('aria-expanded') ||
           element.hasAttribute('aria-selected');
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message, priority = 'polite') {
    const liveRegion = this.getElement('liveRegion');
    
    if (liveRegion && message) {
      // Clear previous announcement
      liveRegion.textContent = '';
      
      // Set priority
      liveRegion.setAttribute('aria-live', priority);
      
      // Add new announcement after a brief delay
      setTimeout(() => {
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }, 100);
      
      // Track announcements
      this.announcements.push({
        message,
        priority,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Return focus to trigger element
   */
  returnFocusToTrigger() {
    // Find the element that likely triggered the current state
    const triggers = document.querySelectorAll('[aria-expanded="true"], .cart-button, .search-input');
    
    if (triggers.length > 0) {
      triggers[0].focus();
    }
  }

  /**
   * Get accessibility summary
   */
  getAccessibilitySummary() {
    const focusableCount = this.findFocusableElements().length;
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
    const buttonsWithoutLabels = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').length;
    
    return {
      focusableElements: focusableCount,
      imagesWithoutAlt,
      buttonsWithoutLabels,
      announcements: this.announcements.length
    };
  }

  /**
   * Test accessibility features
   */
  testAccessibility() {
    console.log('Accessibility Test Results:');
    console.log(this.getAccessibilitySummary());
    
    // Test focus management
    const focusableElements = this.findFocusableElements();
    console.log(`Found ${focusableElements.length} focusable elements`);
    
    // Test announcements
    this.announceToScreenReader('Accessibility test completed');
  }
}