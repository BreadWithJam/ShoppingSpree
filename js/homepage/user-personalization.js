/**
 * User Personalization Module
 * Handles user authentication state, personalized recommendations, and user preferences
 */

import { BaseModule } from './base-module.js';

export class UserPersonalizationManager extends BaseModule {
  constructor() {
    super('UserPersonalizationManager');
    this.user = null;
    this.preferences = {};
    this.recommendations = [];
    this.isLoggedIn = false;
    this.authToken = null;
    this.sessionTimeout = null;
    this.preferencesKey = 'user_preferences';
    this.sessionKey = 'user_session';
  }

  /**
   * Find user-related elements
   */
  async findElements() {
    this.setElement('userAccount', this.findElement('.user-account'));
    this.setElement('userMenu', this.findElement('.user-menu'));
    this.setElement('loginButton', this.findElement('.login-button'));
    this.setElement('logoutButton', this.findElement('.logout-button'));
    this.setElement('userGreeting', this.findElement('.user-greeting'));
    this.setElement('recommendationsSection', this.findElement('.recommendations-section'));
    this.setElement('personalizedContent', this.findElement('.personalized-content'));
  }

  /**
   * Initialize user personalization
   */
  async init() {
    await super.init();
    
    // Load user session and preferences
    await this.loadUserSession();
    await this.loadUserPreferences();
    
    // Update UI based on authentication state
    this.updateAuthenticationUI();
    
    // Load personalized content if user is logged in
    if (this.isLoggedIn) {
      await this.loadPersonalizedRecommendations();
      this.updatePersonalizedContent();
    }
    
    // Set up session management
    this.setupSessionManagement();
  }

  /**
   * Bind user personalization events
   */
  bindEvents() {
    const loginButton = this.getElement('loginButton');
    const logoutButton = this.getElement('logoutButton');
    const userAccount = this.getElement('userAccount');

    if (loginButton) {
      this.addEventListener(loginButton, 'click', this.handleLoginClick);
    }

    if (logoutButton) {
      this.addEventListener(logoutButton, 'click', this.handleLogoutClick);
    }

    if (userAccount) {
      this.addEventListener(userAccount, 'click', this.handleUserAccountClick);
    }

    // Listen for authentication events from other modules
    this.addEventListener(document, 'userLogin', this.handleUserLogin);
    this.addEventListener(document, 'userLogout', this.handleUserLogout);
    this.addEventListener(document, 'preferencesUpdate', this.handlePreferencesUpdate);
    
    // Listen for cart and search events to update recommendations
    this.addEventListener(document, 'cartUpdated', this.handleCartUpdate);
    this.addEventListener(document, 'searchPerformed', this.handleSearchPerformed);
  }

  /**
   * Handle login button click
   */
  handleLoginClick(event) {
    event.preventDefault();
    this.showLoginModal();
  }

  /**
   * Handle logout button click
   */
  async handleLogoutClick(event) {
    event.preventDefault();
    await this.logout();
  }

  /**
   * Handle user account click
   */
  handleUserAccountClick(event) {
    event.preventDefault();
    
    if (this.isLoggedIn) {
      this.toggleUserMenu();
    } else {
      this.showLoginModal();
    }
  }

  /**
   * Handle user login event
   */
  async handleUserLogin(event) {
    const { user, token } = event.detail;
    await this.setUserSession(user, token);
  }

  /**
   * Handle user logout event
   */
  async handleUserLogout() {
    await this.logout();
  }

  /**
   * Handle preferences update event
   */
  async handlePreferencesUpdate(event) {
    const { preferences } = event.detail;
    await this.updateUserPreferences(preferences);
  }

  /**
   * Handle cart update for recommendation updates
   */
  async handleCartUpdate(event) {
    if (this.isLoggedIn) {
      const { action, product } = event.detail;
      await this.updateRecommendationsBasedOnCart(action, product);
    }
  }

  /**
   * Handle search performed for recommendation updates
   */
  async handleSearchPerformed(event) {
    if (this.isLoggedIn) {
      const { query, results } = event.detail;
      await this.updateRecommendationsBasedOnSearch(query, results);
    }
  }

  /**
   * Set user session
   */
  async setUserSession(user, token) {
    try {
      this.user = user;
      this.authToken = token;
      this.isLoggedIn = true;

      // Save session to localStorage
      await this.saveUserSession();

      // Load user preferences and recommendations
      await this.loadUserPreferences();
      await this.loadPersonalizedRecommendations();

      // Update UI
      this.updateAuthenticationUI();
      this.updatePersonalizedContent();

      // Set up session timeout
      this.setupSessionTimeout();

      // Emit login success event
      this.emitUserEvent('userLoginSuccess', { user });

      this.showNotification('Welcome back!', 'success');

    } catch (error) {
      this.handleError(error, 'setUserSession');
      this.showNotification('Login failed. Please try again.', 'error');
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Clear session timeout
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }

      // Make logout API call if needed
      if (this.authToken) {
        await this.logoutAPI();
      }

      // Clear user data
      this.user = null;
      this.authToken = null;
      this.isLoggedIn = false;
      this.recommendations = [];

      // Clear session storage
      await this.clearUserSession();

      // Update UI
      this.updateAuthenticationUI();
      this.clearPersonalizedContent();

      // Emit logout event
      this.emitUserEvent('userLogoutSuccess');

      this.showNotification('You have been logged out.', 'info');

    } catch (error) {
      this.handleError(error, 'logout');
      this.showNotification('Logout failed. Please try again.', 'error');
    }
  }

  /**
   * Load user session from storage
   */
  async loadUserSession() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      
      if (sessionData) {
        const { user, token, timestamp } = JSON.parse(sessionData);
        
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxAge && await this.validateSession(token)) {
          this.user = user;
          this.authToken = token;
          this.isLoggedIn = true;
          this.setupSessionTimeout();
        } else {
          // Session expired, clear it
          await this.clearUserSession();
        }
      }
    } catch (error) {
      this.handleError(error, 'loadUserSession');
      await this.clearUserSession();
    }
  }

  /**
   * Save user session to storage
   */
  async saveUserSession() {
    try {
      const sessionData = {
        user: this.user,
        token: this.authToken,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    } catch (error) {
      this.handleError(error, 'saveUserSession');
    }
  }

  /**
   * Clear user session from storage
   */
  async clearUserSession() {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      this.handleError(error, 'clearUserSession');
    }
  }

  /**
   * Load user preferences
   */
  async loadUserPreferences() {
    try {
      if (this.isLoggedIn && this.authToken) {
        // Load from API if logged in
        this.preferences = await this.getUserPreferencesAPI();
      } else {
        // Load from localStorage for anonymous users
        const savedPreferences = localStorage.getItem(this.preferencesKey);
        this.preferences = savedPreferences ? JSON.parse(savedPreferences) : this.getDefaultPreferences();
      }
    } catch (error) {
      this.handleError(error, 'loadUserPreferences');
      this.preferences = this.getDefaultPreferences();
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };

      if (this.isLoggedIn && this.authToken) {
        // Save to API if logged in
        await this.saveUserPreferencesAPI(this.preferences);
      } else {
        // Save to localStorage for anonymous users
        localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
      }

      // Update personalized content based on new preferences
      this.updatePersonalizedContent();

      // Emit preferences updated event
      this.emitUserEvent('preferencesUpdated', { preferences: this.preferences });

    } catch (error) {
      this.handleError(error, 'updateUserPreferences');
      this.showNotification('Failed to save preferences.', 'error');
    }
  }

  /**
   * Load personalized recommendations
   */
  async loadPersonalizedRecommendations() {
    if (!this.isLoggedIn) return;

    try {
      this.recommendations = await this.getPersonalizedRecommendationsAPI();
      this.updateRecommendationsDisplay();
    } catch (error) {
      this.handleError(error, 'loadPersonalizedRecommendations');
      // Use fallback recommendations
      this.recommendations = await this.getFallbackRecommendations();
      this.updateRecommendationsDisplay();
    }
  }

  /**
   * Update authentication UI
   */
  updateAuthenticationUI() {
    const userAccount = this.getElement('userAccount');
    const loginButton = this.getElement('loginButton');
    const logoutButton = this.getElement('logoutButton');
    const userGreeting = this.getElement('userGreeting');

    if (this.isLoggedIn && this.user) {
      // Show logged-in state
      if (userAccount) {
        userAccount.classList.add('user-account--logged-in');
        userAccount.setAttribute('aria-label', `User account: ${this.user.name || this.user.email}`);
      }

      if (loginButton) {
        loginButton.style.display = 'none';
      }

      if (logoutButton) {
        logoutButton.style.display = 'block';
      }

      if (userGreeting) {
        userGreeting.textContent = `Hello, ${this.user.name || this.user.email.split('@')[0]}!`;
        userGreeting.style.display = 'block';
      }

    } else {
      // Show logged-out state
      if (userAccount) {
        userAccount.classList.remove('user-account--logged-in');
        userAccount.setAttribute('aria-label', 'User account - not logged in');
      }

      if (loginButton) {
        loginButton.style.display = 'block';
      }

      if (logoutButton) {
        logoutButton.style.display = 'none';
      }

      if (userGreeting) {
        userGreeting.style.display = 'none';
      }
    }
  }

  /**
   * Update personalized content
   */
  updatePersonalizedContent() {
    const personalizedContent = this.getElement('personalizedContent');
    
    if (!personalizedContent) return;

    if (this.isLoggedIn) {
      personalizedContent.classList.add('personalized-content--active');
      
      // Apply user preferences to content
      this.applyUserPreferences();
      
      // Show personalized sections
      this.showPersonalizedSections();
    } else {
      personalizedContent.classList.remove('personalized-content--active');
      
      // Apply anonymous preferences
      this.applyUserPreferences();
    }
  }

  /**
   * Apply user preferences to the interface
   */
  applyUserPreferences() {
    const { theme, language, currency, notifications } = this.preferences;

    // Apply theme preference
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Apply language preference
    if (language && language !== 'en') {
      document.documentElement.setAttribute('lang', language);
    }

    // Apply currency preference
    if (currency) {
      document.documentElement.setAttribute('data-currency', currency);
    }

    // Apply notification preferences
    if (notifications === false) {
      document.documentElement.setAttribute('data-notifications', 'disabled');
    }
  }

  /**
   * Show personalized sections
   */
  showPersonalizedSections() {
    // Show recommendations section
    const recommendationsSection = this.getElement('recommendationsSection');
    if (recommendationsSection && this.recommendations.length > 0) {
      recommendationsSection.style.display = 'block';
    }

    // Show other personalized content based on user data
    this.showRecentlyViewed();
    this.showWishlistItems();
    this.showPersonalizedOffers();
  }

  /**
   * Clear personalized content
   */
  clearPersonalizedContent() {
    const personalizedContent = this.getElement('personalizedContent');
    const recommendationsSection = this.getElement('recommendationsSection');
    
    if (personalizedContent) {
      personalizedContent.classList.remove('personalized-content--active');
    }

    if (recommendationsSection) {
      recommendationsSection.style.display = 'none';
    }

    // Hide other personalized sections
    this.hidePersonalizedSections();
  }

  /**
   * Update recommendations display
   */
  updateRecommendationsDisplay() {
    const recommendationsSection = this.getElement('recommendationsSection');
    
    if (!recommendationsSection || this.recommendations.length === 0) return;

    const recommendationsHTML = this.recommendations.map(product => `
      <div class="recommendation-card" data-product-id="${product.id}">
        <img src="${product.image}" alt="${this.escapeHtml(product.name)}" class="recommendation-card__image">
        <div class="recommendation-card__content">
          <h4 class="recommendation-card__title">${this.escapeHtml(product.name)}</h4>
          <p class="recommendation-card__price">$${product.price.toFixed(2)}</p>
          <button class="recommendation-card__action" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');

    recommendationsSection.innerHTML = `
      <div class="recommendations-header">
        <h3>Recommended for You</h3>
      </div>
      <div class="recommendations-grid">
        ${recommendationsHTML}
      </div>
    `;

    // Add event listeners to recommendation cards
    const actionButtons = recommendationsSection.querySelectorAll('.recommendation-card__action');
    actionButtons.forEach(button => {
      this.addEventListener(button, 'click', (event) => {
        const productId = parseInt(event.target.dataset.productId);
        const product = this.recommendations.find(p => p.id === productId);
        if (product) {
          this.handleRecommendationClick(product);
        }
      });
    });
  }

  /**
   * Handle recommendation click
   */
  handleRecommendationClick(product) {
    // Add to cart
    const addToCartEvent = new CustomEvent('addToCart', {
      detail: { product, quantity: 1 }
    });
    document.dispatchEvent(addToCartEvent);

    // Track recommendation interaction
    this.trackRecommendationInteraction(product);
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences() {
    return {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      notifications: true,
      categories: [],
      priceRange: { min: 0, max: 1000 },
      brands: []
    };
  }

  /**
   * API Methods
   */

  /**
   * Validate session with API
   */
  async validateSession(token) {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout API call
   */
  async logoutAPI() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
    } catch (error) {
      // Logout API failure is not critical
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Get user preferences from API
   */
  async getUserPreferencesAPI() {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return this.getDefaultPreferences();
    } catch (error) {
      return this.getDefaultPreferences();
    }
  }

  /**
   * Save user preferences to API
   */
  async saveUserPreferencesAPI(preferences) {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Get personalized recommendations from API
   */
  async getPersonalizedRecommendationsAPI() {
    try {
      const response = await fetch('/api/user/recommendations', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.recommendations || [];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get fallback recommendations
   */
  async getFallbackRecommendations() {
    // Return popular products as fallback
    return [
      { id: 1, name: 'Popular Product 1', price: 29.99, image: '/images/product1.jpg' },
      { id: 2, name: 'Popular Product 2', price: 39.99, image: '/images/product2.jpg' },
      { id: 3, name: 'Popular Product 3', price: 49.99, image: '/images/product3.jpg' }
    ];
  }

  /**
   * Utility Methods
   */

  /**
   * Setup session timeout
   */
  setupSessionTimeout() {
    // Set session timeout for 30 minutes of inactivity
    const timeoutDuration = 30 * 60 * 1000; // 30 minutes
    
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    this.sessionTimeout = setTimeout(() => {
      this.showSessionTimeoutWarning();
    }, timeoutDuration);
  }

  /**
   * Setup session management
   */
  setupSessionManagement() {
    // Reset session timeout on user activity
    const resetTimeout = () => {
      if (this.isLoggedIn) {
        this.setupSessionTimeout();
      }
    };

    // Listen for user activity
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      this.addEventListener(document, event, resetTimeout, { passive: true });
    });
  }

  /**
   * Show session timeout warning
   */
  showSessionTimeoutWarning() {
    const shouldExtend = confirm('Your session is about to expire. Would you like to extend it?');
    
    if (shouldExtend) {
      this.setupSessionTimeout();
    } else {
      this.logout();
    }
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    // This would typically open a login modal
    // For now, just emit an event that other modules can handle
    this.emitUserEvent('showLoginModal');
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu() {
    const userMenu = this.getElement('userMenu');
    
    if (userMenu) {
      const isVisible = userMenu.classList.contains('user-menu--visible');
      
      if (isVisible) {
        userMenu.classList.remove('user-menu--visible');
      } else {
        userMenu.classList.add('user-menu--visible');
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 2rem;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }

  /**
   * Emit user events
   */
  emitUserEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get user preferences
   */
  getUserPreferences() {
    return this.preferences;
  }

  /**
   * Check if user is logged in
   */
  isUserLoggedIn() {
    return this.isLoggedIn;
  }

  /**
   * Placeholder methods for additional personalization features
   */
  
  async updateRecommendationsBasedOnCart(action, product) {
    // Update recommendations based on cart interactions
    if (this.isLoggedIn && product) {
      // This would typically make an API call to update user behavior
      console.log(`Updating recommendations based on cart ${action}:`, product);
    }
  }

  async updateRecommendationsBasedOnSearch(query, results) {
    // Update recommendations based on search behavior
    if (this.isLoggedIn && query) {
      // This would typically make an API call to update user interests
      console.log(`Updating recommendations based on search:`, query);
    }
  }

  showRecentlyViewed() {
    // Show recently viewed products section
  }

  showWishlistItems() {
    // Show wishlist items section
  }

  showPersonalizedOffers() {
    // Show personalized offers section
  }

  hidePersonalizedSections() {
    // Hide all personalized sections
  }

  trackRecommendationInteraction(product) {
    // Track user interaction with recommendations
    console.log('Recommendation interaction:', product);
  }
}