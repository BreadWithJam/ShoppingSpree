/**
 * Cart Manager Module
 * Handles shopping cart functionality, localStorage persistence, and cart UI updates
 */

import { BaseModule } from './base-module.js';

export class CartManager extends BaseModule {
  constructor() {
    super('CartManager');
    this.cart = {
      items: [],
      total: 0,
      itemCount: 0
    };
    this.storageKey = 'ecommerce_cart';
  }

  /**
   * Find cart elements
   */
  async findElements() {
    this.setElement('cartButton', this.findElement('.cart-button'));
    this.setElement('cartCount', this.findElement('.cart-count'));
    this.setElement('cartStatus', this.findElement('#cart-status'));
  }

  /**
   * Initialize cart module
   */
  async init() {
    await super.init();
    
    // Load cart from localStorage
    this.loadCartFromStorage();
    
    // Update cart display
    this.updateCartDisplay();
  }

  /**
   * Bind cart events
   */
  bindEvents() {
    const cartButton = this.getElement('cartButton');

    if (cartButton) {
      this.addEventListener(cartButton, 'click', this.handleCartButtonClick);
    }

    // Listen for add to cart events from product cards
    this.addEventListener(document, 'addToCart', this.handleAddToCart);
    
    // Listen for cart updates from other modules
    this.addEventListener(document, 'updateCart', this.handleCartUpdate);
  }

  /**
   * Handle cart button click
   */
  handleCartButtonClick(event) {
    event.preventDefault();
    
    // Show cart dropdown or navigate to cart page
    this.showCartDropdown();
  }

  /**
   * Handle add to cart events
   */
  handleAddToCart(event) {
    const { product, quantity = 1 } = event.detail;
    this.addItem(product, quantity);
  }

  /**
   * Handle cart update events
   */
  handleCartUpdate(event) {
    const { action, productId, quantity } = event.detail;
    
    switch (action) {
      case 'remove':
        this.removeItem(productId);
        break;
      case 'update':
        this.updateQuantity(productId, quantity);
        break;
      case 'clear':
        this.clearCart();
        break;
    }
  }

  /**
   * Add item to cart with retry mechanism
   */
  addItem(product, quantity = 1) {
    return this.retryOperation(() => this._addItemInternal(product, quantity), 'addItem');
  }

  /**
   * Internal add item implementation
   */
  _addItemInternal(product, quantity = 1) {
    // Validate input parameters
    if (!product || !product.id || !product.name || typeof product.price !== 'number') {
      throw new Error('Invalid product data provided');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Invalid quantity provided');
    }

    const existingItemIndex = this.cart.items.findIndex(
      item => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      this.cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.cart.items.push({
        product: { ...product },
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    this.calculateCartTotals();
    this.saveCartToStorage();
    this.updateCartDisplay();
    this.showAddToCartFeedback(product);

    // Emit cart updated event
    this.emitCartEvent('cartUpdated', { action: 'add', product, quantity });

    return true;
  }

  /**
   * Remove item from cart with retry mechanism
   */
  removeItem(productId) {
    return this.retryOperation(() => this._removeItemInternal(productId), 'removeItem');
  }

  /**
   * Internal remove item implementation
   */
  _removeItemInternal(productId) {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const initialLength = this.cart.items.length;
    this.cart.items = this.cart.items.filter(item => item.product.id !== productId);

    if (this.cart.items.length < initialLength) {
      this.calculateCartTotals();
      this.saveCartToStorage();
      this.updateCartDisplay();

      // Emit cart updated event
      this.emitCartEvent('cartUpdated', { action: 'remove', productId });
      return true;
    }

    return false;
  }

  /**
   * Update item quantity with retry mechanism
   */
  updateQuantity(productId, quantity) {
    return this.retryOperation(() => this._updateQuantityInternal(productId, quantity), 'updateQuantity');
  }

  /**
   * Internal update quantity implementation
   */
  _updateQuantityInternal(productId, quantity) {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('Invalid quantity provided');
    }

    const item = this.cart.items.find(item => item.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this._removeItemInternal(productId);
      } else {
        item.quantity = quantity;
        this.calculateCartTotals();
        this.saveCartToStorage();
        this.updateCartDisplay();

        // Emit cart updated event
        this.emitCartEvent('cartUpdated', { action: 'update', productId, quantity });
        return true;
      }
    }

    return false;
  }

  /**
   * Clear entire cart with retry mechanism
   */
  clearCart() {
    return this.retryOperation(() => this._clearCartInternal(), 'clearCart');
  }

  /**
   * Internal clear cart implementation
   */
  _clearCartInternal() {
    this.cart.items = [];
    this.calculateCartTotals();
    this.saveCartToStorage();
    this.updateCartDisplay();

    // Emit cart updated event
    this.emitCartEvent('cartUpdated', { action: 'clear' });
    return true;
  }

  /**
   * Calculate cart totals
   */
  calculateCartTotals() {
    this.cart.itemCount = this.cart.items.reduce((count, item) => count + item.quantity, 0);
    this.cart.total = this.cart.items.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  /**
   * Update cart display
   */
  updateCartDisplay() {
    const cartCount = this.getElement('cartCount');
    const cartStatus = this.getElement('cartStatus');

    if (cartCount) {
      cartCount.textContent = this.cart.itemCount.toString();
      
      // Add animation for count changes
      cartCount.classList.add('cart-count--updated');
      setTimeout(() => {
        cartCount.classList.remove('cart-count--updated');
      }, 300);
    }

    if (cartStatus) {
      const statusText = this.cart.itemCount === 0 
        ? 'Shopping cart is empty'
        : `Shopping cart with ${this.cart.itemCount} item${this.cart.itemCount !== 1 ? 's' : ''}, total $${this.cart.total.toFixed(2)}`;
      
      cartStatus.textContent = statusText;
    }
  }

  /**
   * Show cart dropdown
   */
  showCartDropdown() {
    // Create cart dropdown if it doesn't exist
    let dropdown = document.getElementById('cart-dropdown');
    
    if (!dropdown) {
      dropdown = this.createCartDropdown();
      document.body.appendChild(dropdown);
    }

    // Update dropdown content
    this.updateCartDropdown(dropdown);
    
    // Show dropdown
    dropdown.classList.add('cart-dropdown--visible');
    
    // Close dropdown on outside click
    const closeDropdown = (event) => {
      if (!dropdown.contains(event.target) && !this.getElement('cartButton').contains(event.target)) {
        dropdown.classList.remove('cart-dropdown--visible');
        document.removeEventListener('click', closeDropdown);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 100);
  }

  /**
   * Create cart dropdown element
   */
  createCartDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'cart-dropdown';
    dropdown.className = 'cart-dropdown';
    dropdown.setAttribute('role', 'dialog');
    dropdown.setAttribute('aria-label', 'Shopping cart');
    
    dropdown.style.cssText = `
      position: absolute;
      top: 70px;
      right: 2rem;
      width: 320px;
      max-height: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease-in-out;
    `;

    return dropdown;
  }

  /**
   * Update cart dropdown content
   */
  updateCartDropdown(dropdown) {
    if (this.cart.items.length === 0) {
      dropdown.innerHTML = `
        <div class="cart-dropdown__empty">
          <p>Your cart is empty</p>
          <a href="/shop" class="button button--primary">Start Shopping</a>
        </div>
      `;
    } else {
      const itemsHTML = this.cart.items.map(item => `
        <div class="cart-dropdown__item">
          <div class="cart-item__info">
            <h4>${this.escapeHtml(item.product.name)}</h4>
            <p>$${(item.product.salePrice || item.product.price).toFixed(2)} × ${item.quantity}</p>
          </div>
          <button class="cart-item__remove" data-product-id="${item.product.id}" aria-label="Remove ${this.escapeHtml(item.product.name)}">×</button>
        </div>
      `).join('');

      dropdown.innerHTML = `
        <div class="cart-dropdown__header">
          <h3>Shopping Cart (${this.cart.itemCount})</h3>
        </div>
        <div class="cart-dropdown__items">
          ${itemsHTML}
        </div>
        <div class="cart-dropdown__footer">
          <div class="cart-dropdown__total">
            <strong>Total: $${this.cart.total.toFixed(2)}</strong>
          </div>
          <div class="cart-dropdown__actions">
            <a href="/cart" class="button button--secondary">View Cart</a>
            <a href="/checkout" class="button button--primary">Checkout</a>
          </div>
        </div>
      `;

      // Add remove button listeners
      const removeButtons = dropdown.querySelectorAll('.cart-item__remove');
      removeButtons.forEach(button => {
        this.addEventListener(button, 'click', (event) => {
          const productId = parseInt(event.target.dataset.productId);
          this.removeItem(productId);
          this.updateCartDropdown(dropdown);
        });
      });
    }

    // Add CSS for dropdown visibility
    const style = document.createElement('style');
    style.textContent = `
      .cart-dropdown--visible {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
      }
      .cart-dropdown__empty {
        padding: 2rem;
        text-align: center;
      }
      .cart-dropdown__header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
      }
      .cart-dropdown__items {
        max-height: 200px;
        overflow-y: auto;
      }
      .cart-dropdown__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #f5f5f5;
      }
      .cart-item__remove {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
      .cart-dropdown__footer {
        padding: 1rem;
        border-top: 1px solid #eee;
      }
      .cart-dropdown__total {
        margin-bottom: 1rem;
        text-align: center;
      }
      .cart-dropdown__actions {
        display: flex;
        gap: 0.5rem;
      }
      .cart-count--updated {
        animation: cartBounce 0.3s ease-in-out;
      }
      
      .cart-count--increased {
        animation: cartBounce 0.3s ease-in-out, cartGlow 0.5s ease-in-out;
      }
      
      .cart-count--decreased {
        animation: cartShrink 0.3s ease-in-out;
      }
      
      @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      
      @keyframes cartGlow {
        0%, 100% { box-shadow: none; }
        50% { box-shadow: 0 0 10px rgba(40, 167, 69, 0.5); }
      }
      
      @keyframes cartShrink {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.8); }
      }
    `;
    
    if (!document.getElementById('cart-dropdown-styles')) {
      style.id = 'cart-dropdown-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Show add to cart feedback
   */
  showAddToCartFeedback(product) {
    // Create temporary feedback notification
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = `Added ${product.name} to cart`;
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    
    feedback.style.cssText = `
      position: fixed;
      top: 80px;
      right: 2rem;
      background: #28a745;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      z-index: 9999;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Show cart error with user-friendly messages
   */
  showCartError(message, isRetryable = false) {
    console.error('Cart error:', message);
    
    // Create error notification
    const errorNotification = document.createElement('div');
    errorNotification.className = 'cart-error-notification';
    errorNotification.setAttribute('role', 'alert');
    errorNotification.setAttribute('aria-live', 'assertive');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'cart-error-message';
    errorMessage.textContent = message;
    
    errorNotification.appendChild(errorMessage);
    
    if (isRetryable) {
      const retryButton = document.createElement('button');
      retryButton.className = 'cart-error-retry';
      retryButton.textContent = 'Retry';
      retryButton.addEventListener('click', () => {
        errorNotification.remove();
        // The retry will be handled by the calling function
      });
      errorNotification.appendChild(retryButton);
    }
    
    errorNotification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 2rem;
      background: #dc3545;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(errorNotification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorNotification.parentNode) {
        errorNotification.remove();
      }
    }, 5000);
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, operationName, showUserError = true, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.handleError(error, `${operationName} (attempt ${attempt})`);
        
        // Don't retry on validation errors
        if (error.message.includes('Invalid') || error.message.includes('required')) {
          break;
        }
        
        // Don't retry on final attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: wait 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    if (showUserError) {
      const userMessage = this.getUserFriendlyErrorMessage(lastError, operationName);
      this.showCartError(userMessage, maxRetries > 1);
    }
    
    throw lastError;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyErrorMessage(error, operationName) {
    const errorMessages = {
      addItem: 'Unable to add item to cart. Please try again.',
      removeItem: 'Unable to remove item from cart. Please try again.',
      updateQuantity: 'Unable to update item quantity. Please try again.',
      clearCart: 'Unable to clear cart. Please try again.',
      saveCartToStorage: 'Unable to save cart. Your changes may not persist.',
      loadCartFromStorage: 'Unable to load saved cart. Starting with empty cart.'
    };

    if (error.message.includes('localStorage')) {
      return 'Cart storage is unavailable. Changes may not be saved.';
    }
    
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return 'Invalid data provided. Please check your input.';
    }
    
    if (error.message.includes('quota')) {
      return 'Storage is full. Please clear some data and try again.';
    }
    
    return errorMessages[operationName] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Save cart to localStorage with retry mechanism
   */
  saveCartToStorage() {
    return this.retryOperation(() => this._saveCartToStorageInternal(), 'saveCartToStorage');
  }

  /**
   * Internal save cart to localStorage implementation
   */
  _saveCartToStorageInternal() {
    // Validate cart data before saving
    if (!this.cart || !Array.isArray(this.cart.items)) {
      throw new Error('Invalid cart data structure');
    }

    const cartData = JSON.stringify(this.cart);
    
    // Check if localStorage is available
    if (typeof Storage === 'undefined') {
      throw new Error('localStorage is not supported');
    }

    // Check storage quota
    try {
      const testKey = 'storage_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('localStorage quota exceeded');
      }
      throw error;
    }

    localStorage.setItem(this.storageKey, cartData);
    return true;
  }

  /**
   * Load cart from localStorage with retry mechanism
   */
  loadCartFromStorage() {
    return this.retryOperation(() => this._loadCartFromStorageInternal(), 'loadCartFromStorage', false);
  }

  /**
   * Internal load cart from localStorage implementation
   */
  _loadCartFromStorageInternal() {
    // Check if localStorage is available
    if (typeof Storage === 'undefined') {
      throw new Error('localStorage is not supported');
    }

    const savedCart = localStorage.getItem(this.storageKey);
    
    if (!savedCart) {
      // No saved cart, initialize empty cart
      this.cart = { items: [], total: 0, itemCount: 0 };
      return true;
    }

    const parsedCart = JSON.parse(savedCart);
    
    // Validate cart structure
    if (!parsedCart || !Array.isArray(parsedCart.items)) {
      throw new Error('Invalid cart data structure in localStorage');
    }

    // Validate each cart item
    for (const item of parsedCart.items) {
      if (!item.product || !item.product.id || !item.product.name || 
          typeof item.product.price !== 'number' || !Number.isInteger(item.quantity) || 
          item.quantity <= 0) {
        throw new Error('Invalid cart item data in localStorage');
      }
    }

    this.cart = {
      items: parsedCart.items || [],
      total: parsedCart.total || 0,
      itemCount: parsedCart.itemCount || 0
    };
    
    // Recalculate totals to ensure accuracy
    this.calculateCartTotals();
    return true;
  }

  /**
   * Emit cart events
   */
  emitCartEvent(eventName, detail) {
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
   * Get cart summary
   */
  getCartSummary() {
    return {
      itemCount: this.cart.itemCount,
      total: this.cart.total,
      items: this.cart.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity
      }))
    };
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId) {
    return this.cart.items.some(item => item.product.id === productId);
  }

  /**
   * Get item quantity in cart
   */
  getItemQuantity(productId) {
    const item = this.cart.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}