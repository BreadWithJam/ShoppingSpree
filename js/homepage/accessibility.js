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
    
    // Enhance existing content
    this.enhanceAccessibility(document.body);
    
    // Enhance form accessibility
    this.enhanceFormAccessibility();
    
    // Setup touch targets for mobile accessibility
    this.setupTouchTargets();
    
    // Validate and report heading hierarchy
    const headingValidation = this.validateHeadingHierarchy();
    if (!headingValidation.isValid) {
      console.warn('Heading hierarchy issues found:', headingValidation.issues);
    }
    
    // Announce page load completion
    setTimeout(() => {
      this.announceContentChange('page-loaded');
    }, 1000);
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
      <p>Use Tab to navigate, Enter or Space to activate, Escape to close dialogs, Arrow keys to navigate within menus</p>
    `;
    
    document.body.appendChild(keyboardHints);
    
    // Add keyboard user detection
    this.setupKeyboardUserDetection();
    
    // Enhance tab order for complex components
    this.enhanceTabOrder();
    
    // Setup roving tabindex for grids
    this.setupRovingTabindex();
  }

  /**
   * Setup keyboard user detection
   */
  setupKeyboardUserDetection() {
    let isKeyboardUser = false;
    
    // Detect keyboard usage
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        isKeyboardUser = true;
        document.body.classList.add('keyboard-user');
      }
    });
    
    // Detect mouse usage
    document.addEventListener('mousedown', () => {
      isKeyboardUser = false;
      document.body.classList.remove('keyboard-user');
    });
  }

  /**
   * Enhance tab order for complex components
   */
  enhanceTabOrder() {
    // Ensure proper tab order in product grids
    const productGrids = document.querySelectorAll('.product-grid');
    productGrids.forEach(grid => {
      const cards = grid.querySelectorAll('.product-card');
      cards.forEach((card, index) => {
        const actionButton = card.querySelector('.product-card__action');
        if (actionButton) {
          actionButton.setAttribute('tabindex', '0');
        }
      });
    });
    
    // Ensure proper tab order in category grids
    const categoryGrids = document.querySelectorAll('.categories-grid');
    categoryGrids.forEach(grid => {
      const cards = grid.querySelectorAll('.category-card');
      cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
      });
    });
    
    // Ensure search suggestions are properly focusable
    const searchSuggestions = document.querySelector('.search-suggestions');
    if (searchSuggestions) {
      searchSuggestions.setAttribute('tabindex', '-1');
    }
  }

  /**
   * Setup roving tabindex for grid navigation
   */
  setupRovingTabindex() {
    // Setup roving tabindex for product grids
    this.setupGridNavigation('.product-grid', '.product-card__action');
    
    // Setup roving tabindex for category grids
    this.setupGridNavigation('.categories-grid', '.category-card');
  }

  /**
   * Setup grid navigation with roving tabindex
   */
  setupGridNavigation(gridSelector, itemSelector) {
    const grids = document.querySelectorAll(gridSelector);
    
    grids.forEach(grid => {
      const items = grid.querySelectorAll(itemSelector);
      let currentIndex = 0;
      
      // Set initial tabindex
      items.forEach((item, index) => {
        item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      });
      
      // Handle arrow key navigation
      grid.addEventListener('keydown', (event) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          return;
        }
        
        event.preventDefault();
        
        const columns = this.getGridColumns(grid);
        const totalItems = items.length;
        
        switch (event.key) {
          case 'ArrowRight':
            currentIndex = (currentIndex + 1) % totalItems;
            break;
          case 'ArrowLeft':
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            break;
          case 'ArrowDown':
            currentIndex = Math.min(currentIndex + columns, totalItems - 1);
            break;
          case 'ArrowUp':
            currentIndex = Math.max(currentIndex - columns, 0);
            break;
          case 'Home':
            currentIndex = 0;
            break;
          case 'End':
            currentIndex = totalItems - 1;
            break;
        }
        
        // Update tabindex and focus
        items.forEach((item, index) => {
          item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
        });
        
        items[currentIndex].focus();
      });
    });
  }

  /**
   * Get number of columns in a grid
   */
  getGridColumns(grid) {
    const gridStyle = window.getComputedStyle(grid);
    const columns = gridStyle.gridTemplateColumns.split(' ').length;
    return columns || 1;
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

    // Enhance product cards with better screen reader support
    this.enhanceProductCards(element);
    
    // Enhance navigation elements
    this.enhanceNavigationElements(element);
    
    // Add landmark roles where missing
    this.addLandmarkRoles(element);
  }

  /**
   * Enhance product cards for screen readers
   */
  enhanceProductCards(element) {
    const productCards = element.querySelectorAll('.product-card');
    productCards.forEach(card => {
      const title = card.querySelector('.product-card__title');
      const price = card.querySelector('.product-card__price');
      const rating = card.querySelector('.product-card__rating');
      const button = card.querySelector('.product-card__action');
      
      if (title && button && !button.getAttribute('aria-label')) {
        const productName = title.textContent.trim();
        button.setAttribute('aria-label', `Add ${productName} to cart`);
      }
      
      // Enhance rating accessibility
      if (rating && !rating.getAttribute('aria-label')) {
        const ratingText = rating.querySelector('.product-card__rating-text');
        const stars = rating.querySelectorAll('.star--filled').length;
        const halfStars = rating.querySelectorAll('.star--half').length;
        const totalRating = stars + (halfStars * 0.5);
        const reviewCount = ratingText ? ratingText.textContent.replace(/[()]/g, '') : '0';
        
        rating.setAttribute('aria-label', `${totalRating} out of 5 stars, ${reviewCount} reviews`);
        rating.setAttribute('role', 'img');
      }
      
      // Add price information to screen readers
      if (price && title) {
        const priceValue = price.textContent.trim();
        const originalPrice = card.querySelector('.product-card__original-price');
        let priceDescription = `Price: ${priceValue}`;
        
        if (originalPrice) {
          const originalPriceValue = originalPrice.textContent.trim();
          priceDescription += `, was ${originalPriceValue}`;
        }
        
        price.setAttribute('aria-label', priceDescription);
      }
    });
  }

  /**
   * Enhance navigation elements for screen readers
   */
  enhanceNavigationElements(element) {
    // Enhance category cards
    const categoryCards = element.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      const title = card.querySelector('.category-card__title');
      if (title && !card.getAttribute('aria-label')) {
        const categoryName = title.textContent.trim();
        card.setAttribute('aria-label', `Browse ${categoryName} category`);
      }
    });
    
    // Enhance section links
    const sectionLinks = element.querySelectorAll('.section-link');
    sectionLinks.forEach(link => {
      if (!link.getAttribute('aria-label')) {
        const linkText = link.textContent.trim();
        const section = link.closest('section');
        const sectionTitle = section ? section.querySelector('.section-title') : null;
        
        if (sectionTitle) {
          const sectionName = sectionTitle.textContent.replace(/\s+/g, ' ').trim();
          link.setAttribute('aria-label', `${linkText} in ${sectionName} section`);
        }
      }
    });
  }

  /**
   * Add landmark roles where missing
   */
  addLandmarkRoles(element) {
    // Ensure main content has proper landmark
    const mainContent = element.querySelector('#main-content');
    if (mainContent && !mainContent.getAttribute('role')) {
      mainContent.setAttribute('role', 'main');
    }
    
    // Ensure navigation has proper landmark
    const navigation = element.querySelector('nav:not([role])');
    if (navigation) {
      navigation.setAttribute('role', 'navigation');
    }
    
    // Ensure sections have proper regions
    const sections = element.querySelectorAll('section:not([role])');
    sections.forEach(section => {
      if (section.querySelector('h1, h2, h3, h4, h5, h6')) {
        section.setAttribute('role', 'region');
        
        // Add aria-labelledby if there's a heading
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading && heading.id) {
          section.setAttribute('aria-labelledby', heading.id);
        }
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
    const headingHierarchy = this.validateHeadingHierarchy();
    
    return {
      focusableElements: focusableCount,
      imagesWithoutAlt,
      buttonsWithoutLabels,
      announcements: this.announcements.length,
      headingHierarchy
    };
  }

  /**
   * Validate heading hierarchy
   */
  validateHeadingHierarchy() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hierarchy = [];
    let issues = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      const id = heading.id;
      
      hierarchy.push({
        level,
        text,
        id,
        element: heading
      });
      
      // Check for proper hierarchy
      if (index === 0 && level !== 1) {
        issues.push(`First heading should be h1, found h${level}`);
      }
      
      if (index > 0) {
        const prevLevel = hierarchy[index - 1].level;
        if (level > prevLevel + 1) {
          issues.push(`Heading level jumps from h${prevLevel} to h${level} - should not skip levels`);
        }
      }
      
      // Check for missing IDs on section headings
      if (level <= 3 && !id && heading.closest('section')) {
        issues.push(`Section heading "${text}" should have an ID for accessibility`);
      }
    });
    
    return {
      headings: hierarchy,
      issues,
      isValid: issues.length === 0
    };
  }

  /**
   * Add screen reader announcements for dynamic content
   */
  announceContentChange(type, details = {}) {
    let message = '';
    
    switch (type) {
      case 'page-loaded':
        message = 'Page loaded successfully';
        break;
      case 'search-results':
        message = `Search completed. ${details.count || 0} results found`;
        break;
      case 'filter-applied':
        message = `Filter applied. ${details.count || 0} items shown`;
        break;
      case 'sort-changed':
        message = `Items sorted by ${details.criteria || 'default'}`;
        break;
      case 'error':
        message = `Error: ${details.message || 'An error occurred'}`;
        break;
      case 'success':
        message = `Success: ${details.message || 'Action completed'}`;
        break;
      default:
        message = details.message || 'Content updated';
    }
    
    this.announceToScreenReader(message, details.priority || 'polite');
  }

  /**
   * Enhance form accessibility
   */
  enhanceFormAccessibility() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Ensure form has proper labeling
      if (!form.getAttribute('aria-label') && !form.getAttribute('aria-labelledby')) {
        const heading = form.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading && heading.id) {
          form.setAttribute('aria-labelledby', heading.id);
        }
      }
      
      // Enhance form inputs
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        // Ensure inputs have labels
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
          if (input.placeholder) {
            input.setAttribute('aria-label', input.placeholder);
          }
        }
        
        // Add required field indicators
        if (input.required && !input.getAttribute('aria-required')) {
          input.setAttribute('aria-required', 'true');
        }
        
        // Enhance error states
        if (input.getAttribute('aria-invalid') === 'true') {
          const errorId = `${input.id}-error`;
          let errorElement = document.getElementById(errorId);
          
          if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'assertive');
            input.parentNode.insertBefore(errorElement, input.nextSibling);
          }
          
          if (!input.getAttribute('aria-describedby')) {
            input.setAttribute('aria-describedby', errorId);
          }
        }
      });
    });
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
    
    // Test color contrast
    this.testColorContrast();
  }

  /**
   * Test color contrast ratios
   */
  testColorContrast() {
    const contrastResults = [];
    
    // Test common text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
    
    textElements.forEach((element, index) => {
      if (index < 20) { // Limit to first 20 elements for performance
        const styles = window.getComputedStyle(element);
        const textColor = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = this.calculateContrastRatio(textColor, backgroundColor);
          
          contrastResults.push({
            element: element.tagName.toLowerCase(),
            textColor,
            backgroundColor,
            contrast: contrast.toFixed(2),
            passes: contrast >= 4.5,
            text: element.textContent.substring(0, 50)
          });
        }
      }
    });
    
    console.log('Color Contrast Test Results:', contrastResults);
    
    const failingElements = contrastResults.filter(result => !result.passes);
    if (failingElements.length > 0) {
      console.warn(`${failingElements.length} elements fail WCAG AA contrast requirements:`, failingElements);
    }
    
    return contrastResults;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1, color2) {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string to RGB values
   */
  parseColor(colorStr) {
    // Handle rgb() and rgba() formats
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    
    // Handle hex colors
    const hexMatch = colorStr.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
      };
    }
    
    return null;
  }

  /**
   * Calculate relative luminance of a color
   */
  getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Enable high contrast mode
   */
  enableHighContrastMode() {
    document.body.classList.add('high-contrast-mode');
    this.announceToScreenReader('High contrast mode enabled');
  }

  /**
   * Disable high contrast mode
   */
  disableHighContrastMode() {
    document.body.classList.remove('high-contrast-mode');
    this.announceToScreenReader('High contrast mode disabled');
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrastMode() {
    if (document.body.classList.contains('high-contrast-mode')) {
      this.disableHighContrastMode();
    } else {
      this.enableHighContrastMode();
    }
  }

  /**
   * Setup touch target optimization
   */
  setupTouchTargets() {
    // Add touch feedback to interactive elements
    const interactiveElements = document.querySelectorAll('button, .button, .category-card, .product-card__action');
    
    interactiveElements.forEach(element => {
      element.classList.add('touch-feedback');
      
      // Add touch event listeners for better feedback
      element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
      element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    });
    
    // Optimize touch targets that are too small
    this.optimizeTouchTargets();
    
    // Add swipe gesture support where appropriate
    this.setupSwipeGestures();
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(event) {
    const element = event.currentTarget;
    element.classList.add('touch-active');
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event) {
    const element = event.currentTarget;
    element.classList.remove('touch-active');
  }

  /**
   * Optimize touch targets that are too small
   */
  optimizeTouchTargets() {
    const elements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Check if element meets minimum touch target size
      const minSize = 44;
      const currentWidth = rect.width;
      const currentHeight = rect.height;
      
      if (currentWidth < minSize || currentHeight < minSize) {
        // Add padding to meet minimum size requirements
        const paddingNeeded = Math.max(0, (minSize - Math.min(currentWidth, currentHeight)) / 2);
        
        if (paddingNeeded > 0) {
          element.style.padding = `${paddingNeeded}px`;
          element.style.minHeight = `${minSize}px`;
          element.style.minWidth = `${minSize}px`;
          element.style.display = 'inline-flex';
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
        }
      }
      
      // Ensure adequate spacing between touch targets
      this.ensureTouchTargetSpacing(element);
    });
  }

  /**
   * Ensure adequate spacing between touch targets
   */
  ensureTouchTargetSpacing(element) {
    const siblings = Array.from(element.parentNode.children);
    const elementIndex = siblings.indexOf(element);
    
    // Check spacing with next sibling
    if (elementIndex < siblings.length - 1) {
      const nextSibling = siblings[elementIndex + 1];
      const elementRect = element.getBoundingClientRect();
      const siblingRect = nextSibling.getBoundingClientRect();
      
      // Calculate distance between elements
      const distance = Math.abs(siblingRect.top - elementRect.bottom);
      const minSpacing = 8; // Minimum 8px spacing
      
      if (distance < minSpacing) {
        element.style.marginBottom = `${minSpacing}px`;
      }
    }
  }

  /**
   * Setup swipe gesture support
   */
  setupSwipeGestures() {
    // Add swipe support to product grids for horizontal scrolling
    const productGrids = document.querySelectorAll('.product-grid');
    
    productGrids.forEach(grid => {
      let startX = 0;
      let startY = 0;
      let isScrolling = false;
      
      grid.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isScrolling = false;
      }, { passive: true });
      
      grid.addEventListener('touchmove', (event) => {
        if (!startX || !startY) return;
        
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);
        
        // Determine scroll direction
        if (!isScrolling) {
          isScrolling = true;
          
          if (diffX > diffY) {
            // Horizontal swipe
            grid.style.touchAction = 'pan-x';
          } else {
            // Vertical swipe
            grid.style.touchAction = 'pan-y';
          }
        }
      }, { passive: true });
      
      grid.addEventListener('touchend', () => {
        startX = 0;
        startY = 0;
        isScrolling = false;
        grid.style.touchAction = 'manipulation';
      }, { passive: true });
    });
  }

  /**
   * Test touch target accessibility
   */
  testTouchTargets() {
    const touchTargets = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]');
    const results = [];
    
    touchTargets.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const meetsMinimumSize = rect.width >= 44 && rect.height >= 44;
      
      results.push({
        element: element.tagName.toLowerCase(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        meetsMinimumSize,
        text: element.textContent.substring(0, 30)
      });
    });
    
    const failingTargets = results.filter(result => !result.meetsMinimumSize);
    
    console.log('Touch Target Test Results:', {
      total: results.length,
      passing: results.length - failingTargets.length,
      failing: failingTargets.length,
      failingTargets
    });
    
    return results;
  }
}