/**
 * Product Manager Module
 * Handles product interactions, add to cart functionality, and product display
 */

import { BaseModule } from './base-module.js';

export class ProductManager extends BaseModule {
  constructor() {
    super('ProductManager');
    this.products = new Map();
  }

  /**
   * Find product elements
   */
  async findElements() {
    this.setElement('productCards', this.findElements('.product-card'));
    this.setElement('productGrid', this.findElement('.product-grid'));
    this.setElement('addToCartButtons', this.findElements('.product-card__action'));
  }

  /**
   * Bind product events
   */
  bindEvents() {
    const addToCartButtons = this.getElement('addToCartButtons');

    // Add to cart button events
    addToCartButtons.forEach(button => {
      this.addEventListener(button, 'click', this.handleAddToCartClick);
    });

    // Product card hover events for accessibility
    const productCards = this.getElement('productCards');
    productCards.forEach(card => {
      this.addEventListener(card, 'mouseenter', this.handleProductHover);
      this.addEventListener(card, 'mouseleave', this.handleProductLeave);
      this.addEventListener(card, 'focus', this.handleProductFocus);
      this.addEventListener(card, 'blur', this.handleProductBlur);
    });

    // Listen for cart updates to update button states
    this.addEventListener(document, 'cartUpdated', this.handleCartUpdated);
  }

  /**
   * Handle add to cart button clicks
   */
  handleAddToCartClick(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const productCard = button.closest('.product-card');
    
    if (!productCard) {
      console.error('Product card not found');
      return;
    }

    const product = this.extractProductData(productCard);
    
    if (product) {
      this.addToCart(product, button);
    }
  }

  /**
   * Extract product data from product card
   */
  extractProductData(productCard) {
    try {
      const titleElement = productCard.querySelector('.product-card__title');
      const priceElement = productCard.querySelector('.product-card__price');
      const originalPriceElement = productCard.querySelector('.product-card__original-price');
      const button = productCard.querySelector('.product-card__action');
      
      if (!titleElement || !priceElement || !button) {
        throw new Error('Required product elements not found');
      }

      const productId = button.dataset.productId || this.generateProductId(titleElement.textContent);
      const name = titleElement.textContent.trim();
      const priceText = priceElement.textContent.replace('$', '');
      const price = parseFloat(priceText);
      
      let originalPrice = null;
      if (originalPriceElement) {
        const originalPriceText = originalPriceElement.textContent.replace('$', '');
        originalPrice = parseFloat(originalPriceText);
      }

      const product = {
        id: parseInt(productId),
        name,
        price: originalPrice || price,
        salePrice: originalPrice ? price : null,
        image: this.getProductImage(productCard),
        category: this.getProductCategory(productCard)
      };

      // Cache product data
      this.products.set(product.id, product);
      
      return product;
      
    } catch (error) {
      this.handleError(error, 'extractProductData');
      return null;
    }
  }

  /**
   * Generate product ID from name if not provided
   */
  generateProductId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10)
      .padEnd(10, '0');
  }

  /**
   * Get product image from card
   */
  getProductImage(productCard) {
    const imageElement = productCard.querySelector('.product-card__image');
    
    if (imageElement) {
      const img = imageElement.querySelector('img');
      if (img) {
        return img.src;
      }
      
      // For emoji-based images, return the emoji
      return imageElement.textContent.trim();
    }
    
    return '/images/placeholder.jpg';
  }

  /**
   * Get product category from card or section
   */
  getProductCategory(productCard) {
    // Try to find category from parent section
    const section = productCard.closest('section');
    if (section) {
      const heading = section.querySelector('h2, h3');
      if (heading) {
        return heading.textContent.replace(/featured|products/gi, '').trim();
      }
    }
    
    return 'General';
  }

  /**
   * Add product to cart
   */
  addToCart(product, button) {
    try {
      // Show loading state
      this.setButtonLoading(button, true);
      
      // Emit add to cart event
      const addToCartEvent = new CustomEvent('addToCart', {
        detail: { product, quantity: 1 }
      });
      
      document.dispatchEvent(addToCartEvent);
      
      // Update button state
      setTimeout(() => {
        this.setButtonLoading(button, false);
        this.setButtonAdded(button, true);
        
        // Reset button after 2 seconds
        setTimeout(() => {
          this.setButtonAdded(button, false);
        }, 2000);
      }, 500);
      
    } catch (error) {
      this.handleError(error, 'addToCart');
      this.setButtonLoading(button, false);
      this.setButtonError(button, true);
      
      setTimeout(() => {
        this.setButtonError(button, false);
      }, 3000);
    }
  }

  /**
   * Set button loading state
   */
  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = `
        <svg class="button-spinner" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
          <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none">
            <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 12 12;360 12 12"/>
          </path>
        </svg>
        Adding...
      `;
      button.classList.add('button--loading');
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Add to Cart';
      button.classList.remove('button--loading');
    }
  }

  /**
   * Set button added state
   */
  setButtonAdded(button, isAdded) {
    if (isAdded) {
      button.textContent = '✓ Added';
      button.classList.add('button--added');
      button.style.backgroundColor = '#28a745';
    } else {
      button.textContent = button.dataset.originalText || 'Add to Cart';
      button.classList.remove('button--added');
      button.style.backgroundColor = '';
    }
  }

  /**
   * Set button error state
   */
  setButtonError(button, hasError) {
    if (hasError) {
      button.textContent = 'Error';
      button.classList.add('button--error');
      button.style.backgroundColor = '#dc3545';
    } else {
      button.textContent = button.dataset.originalText || 'Add to Cart';
      button.classList.remove('button--error');
      button.style.backgroundColor = '';
    }
  }

  /**
   * Handle product card hover
   */
  handleProductHover(event) {
    const productCard = event.currentTarget;
    productCard.classList.add('product-card--hovered');
    
    // Preload product image if needed
    this.preloadProductImage(productCard);
  }

  /**
   * Handle product card leave
   */
  handleProductLeave(event) {
    const productCard = event.currentTarget;
    productCard.classList.remove('product-card--hovered');
  }

  /**
   * Handle product card focus
   */
  handleProductFocus(event) {
    const productCard = event.currentTarget;
    productCard.classList.add('product-card--focused');
  }

  /**
   * Handle product card blur
   */
  handleProductBlur(event) {
    const productCard = event.currentTarget;
    productCard.classList.remove('product-card--focused');
  }

  /**
   * Handle cart updates to update button states
   */
  handleCartUpdated(event) {
    const { action, product } = event.detail;
    
    if (action === 'add' && product) {
      // Update button states for the added product
      this.updateProductButtonStates(product.id);
    }
  }

  /**
   * Update button states for a specific product
   */
  updateProductButtonStates(productId) {
    const addToCartButtons = this.getElement('addToCartButtons');
    
    addToCartButtons.forEach(button => {
      const buttonProductId = parseInt(button.dataset.productId);
      
      if (buttonProductId === productId) {
        // You could show "In Cart" state or quantity here
        // For now, just add a visual indicator
        button.classList.add('button--in-cart');
      }
    });
  }

  /**
   * Preload product image
   */
  preloadProductImage(productCard) {
    const imageElement = productCard.querySelector('.product-card__image img');
    
    if (imageElement && imageElement.dataset.src) {
      // Lazy loading implementation
      const img = new Image();
      img.onload = () => {
        imageElement.src = img.src;
        imageElement.classList.add('product-image--loaded');
      };
      img.src = imageElement.dataset.src;
    }
  }

  /**
   * Filter products by category
   */
  filterProductsByCategory(category) {
    const productCards = this.getElement('productCards');
    
    productCards.forEach(card => {
      const productCategory = this.getProductCategory(card);
      
      if (category === 'all' || productCategory.toLowerCase().includes(category.toLowerCase())) {
        card.style.display = '';
        card.setAttribute('aria-hidden', 'false');
      } else {
        card.style.display = 'none';
        card.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /**
   * Sort products by criteria
   */
  sortProducts(criteria) {
    const productGrid = this.getElement('productGrid');
    const productCards = Array.from(this.getElement('productCards'));
    
    if (!productGrid || productCards.length === 0) return;

    productCards.sort((a, b) => {
      switch (criteria) {
        case 'price-low':
          return this.getProductPrice(a) - this.getProductPrice(b);
        case 'price-high':
          return this.getProductPrice(b) - this.getProductPrice(a);
        case 'name':
          return this.getProductName(a).localeCompare(this.getProductName(b));
        default:
          return 0;
      }
    });

    // Re-append sorted cards
    productCards.forEach(card => {
      productGrid.appendChild(card);
    });
  }

  /**
   * Get product price from card
   */
  getProductPrice(productCard) {
    const priceElement = productCard.querySelector('.product-card__price');
    if (priceElement) {
      return parseFloat(priceElement.textContent.replace('$', ''));
    }
    return 0;
  }

  /**
   * Get product name from card
   */
  getProductName(productCard) {
    const nameElement = productCard.querySelector('.product-card__title');
    return nameElement ? nameElement.textContent.trim() : '';
  }

  /**
   * Get cached product data
   */
  getProduct(productId) {
    return this.products.get(productId);
  }

  /**
   * Get all cached products
   */
  getAllProducts() {
    return Array.from(this.products.values());
  }

  /**
   * Update product display
   */
  updateProductDisplay(products) {
    const productGrid = this.getElement('productGrid');
    if (!productGrid) return;

    // Clear existing products
    productGrid.innerHTML = '';

    // Add new products
    products.forEach(product => {
      const productCard = this.createProductCard(product);
      productGrid.appendChild(productCard);
    });

    // Re-bind events for new elements
    this.findElements();
    this.bindEvents();
  }

  /**
   * Create product card element
   */
  createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    
    const salePrice = product.salePrice;
    const originalPrice = product.price;
    const displayPrice = salePrice || originalPrice;
    
    card.innerHTML = `
      <div class="product-card__image" aria-hidden="true">
        ${product.image.startsWith('http') ? 
          `<img src="${product.image}" alt="${this.escapeHtml(product.name)}" loading="lazy">` :
          product.image
        }
      </div>
      <div class="product-card__content">
        <h3 class="product-card__title">${this.escapeHtml(product.name)}</h3>
        <div class="product-card__pricing">
          <span class="product-card__price">$${displayPrice.toFixed(2)}</span>
          ${salePrice ? `<span class="product-card__original-price">$${originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <button class="product-card__action button button--primary" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
    
    return card;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}