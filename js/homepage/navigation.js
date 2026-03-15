/**
 * Navigation Manager Module
 * Handles mobile navigation, menu interactions, and navigation accessibility
 */

import { BaseModule } from './base-module.js';

export class NavigationManager extends BaseModule {
  constructor() {
    super('NavigationManager');
    this.isMenuOpen = false;
    this.focusableElements = [];
  }

  /**
   * Find navigation elements
   */
  async findElements() {
    this.setElement('navToggle', this.findElement('.nav-toggle', false));
    this.setElement('navMenu', this.findElement('.nav-menu'));
    this.setElement('navLinks', this.findElements('.nav-menu__link'));
    this.setElement('header', this.findElement('.site-header'));
  }

  /**
   * Bind navigation events
   */
  bindEvents() {
    const navToggle = this.getElement('navToggle');
    const navLinks = this.getElement('navLinks');

    // Mobile menu toggle
    if (navToggle) {
      this.addEventListener(navToggle, 'click', this.toggleMobileMenu);
      this.addEventListener(navToggle, 'keydown', this.handleToggleKeydown);
    }

    // Navigation link interactions
    navLinks.forEach(link => {
      this.addEventListener(link, 'click', this.handleNavLinkClick);
      this.addEventListener(link, 'keydown', this.handleNavLinkKeydown);
    });

    // Close menu on outside click
    this.addEventListener(document, 'click', this.handleOutsideClick);

    // Handle escape key
    this.addEventListener(document, 'keydown', this.handleEscapeKey);

    // Handle window resize
    this.addEventListener(window, 'resize', this.throttle(this.handleResize, 250));
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(event) {
    event.preventDefault();
    
    const navToggle = this.getElement('navToggle');
    const navMenu = this.getElement('navMenu');
    
    if (!navToggle || !navMenu) return;

    this.isMenuOpen = !this.isMenuOpen;
    
    // Update ARIA attributes
    navToggle.setAttribute('aria-expanded', this.isMenuOpen.toString());
    
    // Toggle menu visibility
    if (this.isMenuOpen) {
      navMenu.classList.add('nav-menu--open');
      this.trapFocus();
    } else {
      navMenu.classList.remove('nav-menu--open');
      this.releaseFocus();
    }

    // Animate toggle button
    this.animateToggleButton();
  }

  /**
   * Handle toggle button keydown
   */
  handleToggleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleMobileMenu(event);
    }
  }

  /**
   * Handle navigation link clicks
   */
  handleNavLinkClick(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');
    
    // Close mobile menu when link is clicked
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    }

    // Handle internal navigation
    if (href && href.startsWith('/')) {
      // Add loading state or navigation logic here
      console.log(`Navigating to: ${href}`);
    }
  }

  /**
   * Handle navigation link keydown
   */
  handleNavLinkKeydown(event) {
    if (event.key === 'Enter') {
      event.currentTarget.click();
    }
  }

  /**
   * Handle outside clicks to close menu
   */
  handleOutsideClick(event) {
    if (!this.isMenuOpen) return;

    const header = this.getElement('header');
    if (header && !header.contains(event.target)) {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle escape key to close menu
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape' && this.isMenuOpen) {
      this.closeMobileMenu();
      
      // Return focus to toggle button
      const navToggle = this.getElement('navToggle');
      if (navToggle) {
        navToggle.focus();
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (!this.isMenuOpen) return;

    const navToggle = this.getElement('navToggle');
    const navMenu = this.getElement('navMenu');
    
    if (!navToggle || !navMenu) return;

    this.isMenuOpen = false;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('nav-menu--open');
    
    this.releaseFocus();
    this.animateToggleButton();
  }

  /**
   * Animate toggle button
   */
  animateToggleButton() {
    const navToggle = this.getElement('navToggle');
    if (!navToggle) return;

    const lines = navToggle.querySelectorAll('.nav-toggle__line');
    
    if (this.isMenuOpen) {
      // Transform to X
      lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      // Transform back to hamburger
      lines[0].style.transform = 'none';
      lines[1].style.opacity = '1';
      lines[2].style.transform = 'none';
    }
  }

  /**
   * Trap focus within mobile menu
   */
  trapFocus() {
    const navMenu = this.getElement('navMenu');
    if (!navMenu) return;

    // Find all focusable elements in the menu
    this.focusableElements = navMenu.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );

    if (this.focusableElements.length > 0) {
      // Focus first element
      this.focusableElements[0].focus();
      
      // Add keydown listener for tab trapping
      this.addEventListener(navMenu, 'keydown', this.handleFocusTrap);
    }
  }

  /**
   * Handle focus trapping
   */
  handleFocusTrap(event) {
    if (event.key !== 'Tab') return;

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

  /**
   * Release focus trap
   */
  releaseFocus() {
    const navMenu = this.getElement('navMenu');
    if (navMenu) {
      // Remove focus trap listener
      this.eventListeners = this.eventListeners.filter(
        listener => !(listener.element === navMenu && listener.event === 'keydown')
      );
    }
    
    this.focusableElements = [];
  }

  /**
   * Set active navigation item
   */
  setActiveNavItem(href) {
    const navLinks = this.getElement('navLinks');
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === href) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('nav-menu__link--active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('nav-menu__link--active');
      }
    });
  }

  /**
   * Get current menu state
   */
  get menuOpen() {
    return this.isMenuOpen;
  }
}