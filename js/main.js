/**
 * Main JavaScript Entry Point
 * Ecommerce Homepage - Modern ES6+ Implementation
 */
console.log('main.js execution started');

// Import modules from homepage folder
import { ShopManager } from './shop/shop-manager.js';
import { NavigationManager } from './homepage/navigation.js';
import { SearchManager } from './homepage/search.js';
import { CartManager } from './homepage/cart.js';
import { ProductManager } from './homepage/product.js';
import { AccessibilityManager } from './homepage/accessibility.js';
import { PerformanceManager } from './homepage/performance.js';
import { HeroImageLoader } from './homepage/hero-image-loader.js';
import { LazyLoadingManager } from './homepage/lazy-loading.js';
import { UserPersonalizationManager } from './homepage/user-personalization.js';
import { TrustSignals } from './homepage/trust-signals.js';
import { StackedCardsManager } from './homepage/stacked-cards.js';
import { setupMockApi } from './utils/mock-api.js';

/**
 * Application Class - Main application controller
 */
class EcommerceApp {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    this.deferredModules = [];
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      setupMockApi();

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize core modules
      await this.initializeModules();

      // Schedule deferred/optional modules when browser is idle
      this.initializeDeferredModules();
      
      // Set up global error handling
      this.setupErrorHandling();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('EcommerceApp initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EcommerceApp:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize all application modules
   */
  async initializeModules() {
    const immediateModules = [
      { name: 'navigation', module: NavigationManager, selector: '.site-header' },
      { name: 'search', module: SearchManager, selector: '.search-form' },
      { name: 'cart', module: CartManager, selector: '.cart-component' },
      { name: 'product', module: ProductManager, selector: '.product-grid' },
      { name: 'shop', module: ShopManager, selector: '#product-grid' },
      { name: 'stackedCards', module: StackedCardsManager, selector: '.stacked-cards-container' },
      { name: 'heroImageLoader', module: HeroImageLoader, selector: '[data-hero-image], .hero-section__media' },
      { name: 'lazyLoading', module: LazyLoadingManager },
      { name: 'accessibility', module: AccessibilityManager }
    ];

    const deferredModules = [
      { name: 'userPersonalization', module: UserPersonalizationManager, selector: '.user-account, .login-button, .personalized-content' },
      { name: 'trustSignals', module: TrustSignals, selector: '.trust-signals, .customer-reviews, .social-proof' },
      { name: 'performance', module: PerformanceManager }
    ];

    for (const config of immediateModules) {
      await this.safeInitializeModule(config);
    }

    this.deferredModules = deferredModules;
  }

  async safeInitializeModule(config) {
    if (this.modules.has(config.name)) {
      return;
    }

    if (!this.shouldInitializeModule(config)) {
      console.info(`Skipping ${config.name} module – no matching DOM nodes found.`);
      return;
    }

    try {
      const instance = new config.module();
      await instance.init?.();
      this.modules.set(config.name, instance);
      console.log(`${config.name} module initialized`);
    } catch (error) {
      console.error(`Failed to initialize ${config.name} module:`, error);
    }
  }

  shouldInitializeModule(config) {
    if (!config.selector) {
      return true;
    }

    return Boolean(document.querySelector(config.selector));
  }

  initializeDeferredModules() {
    if (!Array.isArray(this.deferredModules) || !this.deferredModules.length) {
      return;
    }

    const schedule = window.requestIdleCallback || ((cb) => setTimeout(() => cb({}), 150));

    this.deferredModules.forEach(config => {
      schedule(() => {
        this.safeInitializeModule(config);
      });
    });
  }

  /**
   * Set up global error handling
   */
  setupErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error, 'global');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'promise');
    });
  }

  /**
   * Handle application errors gracefully
   */
  handleError(error, context = 'unknown') {
    // Log error for debugging
    console.error(`Error in ${context}:`, error);

    // Show user-friendly message for critical errors
    if (this.isCriticalError(error)) {
      this.showErrorMessage('Something went wrong. Please refresh the page and try again.');
    }
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    // Show fallback message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <p>Unable to load the application. Please refresh the page.</p>
      <button onclick="window.location.reload()">Refresh Page</button>
    `;
    errorMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      text-align: center;
      z-index: 9999;
    `;
    
    document.body.appendChild(errorMessage);
  }

  /**
   * Determine if an error is critical
   */
  isCriticalError(error) {
    const criticalPatterns = [
      /network/i,
      /fetch/i,
      /cors/i,
      /security/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message || error.toString())
    );
  }

  /**
   * Show user-friendly error message
   */
  showErrorMessage(message) {
    // Create or update error notification
    let notification = document.getElementById('error-notification');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'error-notification';
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'assertive');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        max-width: 300px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Get a specific module instance
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Check if application is initialized
   */
  get initialized() {
    return this.isInitialized;
  }
}

// Create and initialize the application
const app = new EcommerceApp();

// Initialize when script loads
app.init().catch(error => {
  console.error('Failed to start application:', error);
});

// Make app available globally for debugging
window.EcommerceApp = app;

// Export for module usage
export default app;