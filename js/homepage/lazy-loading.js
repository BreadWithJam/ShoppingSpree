/**
 * Lazy Loading Manager Module
 * Handles progressive image loading with intersection observer
 */

import { BaseModule } from './base-module.js';

export class LazyLoadingManager extends BaseModule {
  constructor() {
    super('LazyLoadingManager');
    this.observer = null;
    this.loadedImages = new Set();
    this.failedImages = new Set();
  }

  /**
   * Initialize lazy loading
   */
  async init() {
    await this.findElements();
    this.setupIntersectionObserver();
    this.bindEvents();
    this.observeImages();
  }

  /**
   * Find lazy loading elements
   */
  async findElements() {
    this.setElement('lazyImages', this.findElements('img[loading="lazy"]'));
    this.setElement('productCards', this.findElements('.product-card'));
  }

  /**
   * Set up intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
      return;
    }

    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * Bind events for error handling
   */
  bindEvents() {
    const lazyImages = this.getElement('lazyImages');
    
    lazyImages.forEach(img => {
      this.addEventListener(img, 'load', this.handleImageLoad);
      this.addEventListener(img, 'error', this.handleImageError);
    });
  }

  /**
   * Start observing images
   */
  observeImages() {
    if (!this.observer) return;

    const lazyImages = this.getElement('lazyImages');
    
    lazyImages.forEach(img => {
      // Add loading placeholder
      this.addLoadingPlaceholder(img);
      
      // Start observing
      this.observer.observe(img);
    });
  }

  /**
   * Load image when it enters viewport
   */
  loadImage(img) {
    try {
      // If image already has src, it's already loaded
      if (img.src && !img.src.includes('placeholder')) {
        return;
      }

      // Get the actual image URL from data-src or construct from existing src
      const imageUrl = img.dataset.src || img.src;
      
      if (!imageUrl) {
        this.handleImageError({ target: img });
        return;
      }

      // Show loading state
      this.showLoadingState(img);

      // Create new image to preload
      const newImg = new Image();
      
      newImg.onload = () => {
        img.src = imageUrl;
        img.classList.add('lazy-loaded');
        this.hideLoadingState(img);
        this.loadedImages.add(img);
      };

      newImg.onerror = () => {
        this.handleImageError({ target: img });
      };

      // Start loading
      newImg.src = imageUrl;

    } catch (error) {
      this.handleError(error, 'loadImage');
      this.handleImageError({ target: img });
    }
  }

  /**
   * Handle successful image load
   */
  handleImageLoad(event) {
    const img = event.target;
    img.classList.add('lazy-loaded');
    this.hideLoadingState(img);
    this.loadedImages.add(img);
  }

  /**
   * Handle image loading error
   */
  handleImageError(event) {
    const img = event.target;
    const productCard = img.closest('.product-card');
    
    if (!productCard) return;

    // Mark as failed
    this.failedImages.add(img);
    img.classList.add('lazy-error');
    
    // Hide loading state
    this.hideLoadingState(img);
    
    // Show error state
    this.showErrorState(img);
  }

  /**
   * Add loading placeholder to image container
   */
  addLoadingPlaceholder(img) {
    const container = img.closest('.product-card__image-container');
    if (!container) return;

    // Check if placeholder already exists
    if (container.querySelector('.lazy-loading-placeholder')) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'lazy-loading-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    
    placeholder.innerHTML = `
      <div class="lazy-loading-spinner"></div>
      <div class="lazy-loading-text">Loading...</div>
    `;

    container.appendChild(placeholder);
  }

  /**
   * Show loading state
   */
  showLoadingState(img) {
    const container = img.closest('.product-card__image-container');
    if (!container) return;

    const placeholder = container.querySelector('.lazy-loading-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }

    img.style.opacity = '0';
  }

  /**
   * Hide loading state
   */
  hideLoadingState(img) {
    const container = img.closest('.product-card__image-container');
    if (!container) return;

    const placeholder = container.querySelector('.lazy-loading-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    img.style.opacity = '1';
  }

  /**
   * Show error state
   */
  showErrorState(img) {
    const container = img.closest('.product-card__image-container');
    if (!container) return;

    // Remove loading placeholder
    const placeholder = container.querySelector('.lazy-loading-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Check if error state already exists
    if (container.querySelector('.lazy-error-state')) return;

    const errorState = document.createElement('div');
    errorState.className = 'lazy-error-state';
    errorState.setAttribute('aria-hidden', 'true');
    
    errorState.innerHTML = `
      <div class="lazy-error-icon">⚠️</div>
      <div class="lazy-error-text">Image failed to load</div>
      <button class="lazy-retry-button" type="button">Retry</button>
    `;

    // Add retry functionality
    const retryButton = errorState.querySelector('.lazy-retry-button');
    this.addEventListener(retryButton, 'click', () => {
      errorState.remove();
      img.classList.remove('lazy-error');
      this.failedImages.delete(img);
      this.loadImage(img);
    });

    container.appendChild(errorState);
    
    // Hide the failed image
    img.style.display = 'none';
  }

  /**
   * Load all images (fallback for browsers without IntersectionObserver)
   */
  loadAllImages() {
    const lazyImages = this.getElement('lazyImages');
    
    lazyImages.forEach(img => {
      this.loadImage(img);
    });
  }

  /**
   * Get optimized image URL based on device capabilities
   */
  getOptimizedImageUrl(originalUrl, width = 400, quality = 80) {
    try {
      // For Unsplash images, add optimization parameters
      if (originalUrl.includes('unsplash.com')) {
        const url = new URL(originalUrl);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', quality.toString());
        
        // Add WebP format for supported browsers
        if (this.supportsWebP()) {
          url.searchParams.set('fm', 'webp');
        }
        
        return url.toString();
      }
      
      return originalUrl;
    } catch (error) {
      this.handleError(error, 'getOptimizedImageUrl');
      return originalUrl;
    }
  }

  /**
   * Check if browser supports WebP format
   */
  supportsWebP() {
    if (this._webpSupport !== undefined) {
      return this._webpSupport;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return this._webpSupport;
  }

  /**
   * Update image sources with optimized URLs
   */
  optimizeImageSources() {
    const lazyImages = this.getElement('lazyImages');
    
    lazyImages.forEach(img => {
      const originalSrc = img.src || img.dataset.src;
      if (originalSrc) {
        const optimizedUrl = this.getOptimizedImageUrl(originalSrc);
        
        if (img.dataset.src) {
          img.dataset.src = optimizedUrl;
        } else {
          img.src = optimizedUrl;
        }
      }
    });
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    const totalImages = this.getElement('lazyImages').length;
    const loadedCount = this.loadedImages.size;
    const failedCount = this.failedImages.size;
    const pendingCount = totalImages - loadedCount - failedCount;

    return {
      total: totalImages,
      loaded: loadedCount,
      failed: failedCount,
      pending: pendingCount,
      loadedPercentage: totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0
    };
  }

  /**
   * Cleanup observer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.loadedImages.clear();
    this.failedImages.clear();
    
    super.destroy();
  }
}