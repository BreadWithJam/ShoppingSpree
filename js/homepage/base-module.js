/**
 * Base Module Class
 * Provides common functionality for all application modules
 */

export class BaseModule {
  constructor(name) {
    this.name = name;
    this.isInitialized = false;
    this.elements = new Map();
    this.eventListeners = [];
  }

  /**
   * Initialize the module - to be overridden by subclasses
   */
  async init() {
    try {
      await this.findElements();
      this.bindEvents();
      this.isInitialized = true;
      console.log(`${this.name} module initialized`);
    } catch (error) {
      console.error(`Failed to initialize ${this.name} module:`, error);
      throw error;
    }
  }

  /**
   * Find and cache DOM elements - to be overridden by subclasses
   */
  async findElements() {
    // Override in subclasses
  }

  /**
   * Bind event listeners - to be overridden by subclasses
   */
  bindEvents() {
    // Override in subclasses
  }

  /**
   * Add an event listener and track it for cleanup
   */
  addEventListener(element, event, handler, options = {}) {
    if (!element) {
      console.warn(`Cannot add event listener: element is null for ${this.name} module`);
      return;
    }

    const boundHandler = handler.bind(this);
    element.addEventListener(event, boundHandler, options);
    
    this.eventListeners.push({
      element,
      event,
      handler: boundHandler,
      options
    });
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];
  }

  /**
   * Find element by selector and cache it
   */
  findElement(selector, required = true) {
    const element = document.querySelector(selector);
    
    if (!element && required) {
      console.warn(`Required element not found: ${selector} in ${this.name} module`);
    }
    
    return element;
  }

  /**
   * Find multiple elements by selector
   */
  findElements(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Safely get cached element
   */
  getElement(key) {
    return this.elements.get(key);
  }

  /**
   * Cache element with key
   */
  setElement(key, element) {
    this.elements.set(key, element);
  }

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Handle errors gracefully
   */
  handleError(error, context = 'unknown') {
    console.error(`Error in ${this.name} module (${context}):`, error);
    
    // Emit custom error event for global error handling
    const errorEvent = new CustomEvent('moduleError', {
      detail: {
        module: this.name,
        context,
        error
      }
    });
    
    document.dispatchEvent(errorEvent);
  }

  /**
   * Cleanup module resources
   */
  destroy() {
    this.removeEventListeners();
    this.elements.clear();
    this.isInitialized = false;
    console.log(`${this.name} module destroyed`);
  }

  /**
   * Check if module is initialized
   */
  get initialized() {
    return this.isInitialized;
  }
}