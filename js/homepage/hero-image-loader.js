/**
 * Hero Image Loader Module
 * Handles progressive loading, error states, and optimization for hero section images
 */

import { BaseModule } from './base-module.js';

export class HeroImageLoader extends BaseModule {
  constructor() {
    super('HeroImageLoader');
    this.loadingStates = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Initialize hero image loading
   */
  async init() {
    await super.init();
    this.setupHeroImageLoading();
  }

  /**
   * Find hero image elements
   */
  async findElements() {
    this.setElement('heroImage', document.querySelector('[data-hero-image]'));
    this.setElement('heroPicture', document.querySelector('.hero-section__picture'));
    this.setElement('loadingPlaceholder', document.querySelector('.hero-section__loading-placeholder'));
    this.setElement('errorState', document.querySelector('.hero-section__error-state'));
    this.setElement('imageContainer', document.querySelector('.hero-section__image-container'));
  }

  /**
   * Bind hero image events
   */
  bindEvents() {
    const heroImage = this.getElement('heroImage');
    
    if (heroImage) {
      this.addEventListener(heroImage, 'load', this.handleImageLoad);
      this.addEventListener(heroImage, 'error', this.handleImageError);
      this.addEventListener(heroImage, 'loadstart', this.handleImageLoadStart);
    }

    // Handle retry button if error state is shown
    const errorState = this.getElement('errorState');
    if (errorState) {
      this.addEventListener(errorState, 'click', this.handleRetryClick);
    }
  }

  /**
   * Setup hero image loading with progressive enhancement
   */
  setupHeroImageLoading() {
    const heroImage = this.getElement('heroImage');
    const heroPicture = this.getElement('heroPicture');
    const loadingPlaceholder = this.getElement('loadingPlaceholder');

    if (!heroImage || !heroPicture || !loadingPlaceholder) {
      console.warn('Hero image elements not found');
      return;
    }

    // Set initial loading state
    this.setLoadingState('loading');

    // Check if image is already cached/loaded
    if (heroImage.complete && heroImage.naturalHeight !== 0) {
      this.handleImageLoad();
    } else {
      // Start loading process
      this.startImageLoading();
    }

    // Setup format detection and optimization
    this.optimizeImageFormat();
    
    // Setup responsive image loading
    this.setupResponsiveLoading();
  }

  /**
   * Start image loading process
   */
  startImageLoading() {
    const heroImage = this.getElement('heroImage');
    
    if (!heroImage) return;

    // Add loading timeout
    const loadingTimeout = setTimeout(() => {
      if (this.getLoadingState() === 'loading') {
        console.warn('Hero image loading timeout');
        this.handleImageError();
      }
    }, 10000); // 10 second timeout

    // Store timeout for cleanup
    this.loadingTimeout = loadingTimeout;

    // Trigger loading by ensuring src is set
    if (!heroImage.src && heroImage.dataset.src) {
      heroImage.src = heroImage.dataset.src;
    }
  }

  /**
   * Handle image load start
   */
  handleImageLoadStart = () => {
    this.setLoadingState('loading');
    console.log('Hero image loading started');
  }

  /**
   * Handle successful image load
   */
  handleImageLoad = () => {
    const heroImage = this.getElement('heroImage');
    const heroPicture = this.getElement('heroPicture');
    const loadingPlaceholder = this.getElement('loadingPlaceholder');

    if (!heroImage || !heroPicture || !loadingPlaceholder) return;

    // Clear loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    // Set loaded state
    this.setLoadingState('loaded');

    // Add loaded classes for CSS transitions
    heroPicture.classList.add('loaded');
    loadingPlaceholder.classList.add('loaded');

    // Hide loading placeholder after transition
    setTimeout(() => {
      loadingPlaceholder.style.display = 'none';
    }, 300);

    // Emit load event
    const loadEvent = new CustomEvent('heroImageLoaded', {
      detail: { 
        image: heroImage,
        loadTime: performance.now(),
        naturalWidth: heroImage.naturalWidth,
        naturalHeight: heroImage.naturalHeight
      }
    });
    document.dispatchEvent(loadEvent);

    console.log('Hero image loaded successfully');
  }

  /**
   * Handle image load error
   */
  handleImageError = () => {
    const heroImage = this.getElement('heroImage');
    const errorState = this.getElement('errorState');
    const loadingPlaceholder = this.getElement('loadingPlaceholder');

    if (!heroImage) return;

    // Clear loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }

    const currentRetries = this.retryAttempts.get(heroImage.src) || 0;

    if (currentRetries < this.maxRetries) {
      // Attempt retry
      this.retryImageLoad(heroImage);
    } else {
      // Show error state
      this.setLoadingState('error');
      
      if (loadingPlaceholder) {
        loadingPlaceholder.style.display = 'none';
      }
      
      if (errorState) {
        errorState.hidden = false;
        errorState.innerHTML = `
          <div class="hero-section__error-icon">⚠️</div>
          <p class="hero-section__error-text">Image failed to load</p>
          <button class="hero-section__retry-button button button--secondary" type="button">
            Retry
          </button>
        `;
      }

      // Emit error event
      const errorEvent = new CustomEvent('heroImageError', {
        detail: { 
          image: heroImage,
          src: heroImage.src,
          retries: currentRetries
        }
      });
      document.dispatchEvent(errorEvent);

      console.error('Hero image failed to load after', currentRetries, 'retries');
    }
  }

  /**
   * Retry image loading
   */
  retryImageLoad(image) {
    const currentRetries = this.retryAttempts.get(image.src) || 0;
    this.retryAttempts.set(image.src, currentRetries + 1);

    console.log(`Retrying hero image load (attempt ${currentRetries + 1}/${this.maxRetries})`);

    // Wait before retry
    setTimeout(() => {
      // Try loading with cache-busting parameter
      const originalSrc = image.src.split('?')[0];
      const cacheBuster = `?retry=${currentRetries + 1}&t=${Date.now()}`;
      image.src = originalSrc + cacheBuster;
    }, this.retryDelay * (currentRetries + 1));
  }

  /**
   * Handle retry button click
   */
  handleRetryClick = () => {
    const heroImage = this.getElement('heroImage');
    const errorState = this.getElement('errorState');
    const loadingPlaceholder = this.getElement('loadingPlaceholder');

    if (!heroImage) return;

    // Reset retry attempts
    this.retryAttempts.delete(heroImage.src);

    // Hide error state
    if (errorState) {
      errorState.hidden = true;
    }

    // Show loading state
    if (loadingPlaceholder) {
      loadingPlaceholder.style.display = 'flex';
      loadingPlaceholder.classList.remove('loaded');
    }

    // Reset picture state
    const heroPicture = this.getElement('heroPicture');
    if (heroPicture) {
      heroPicture.classList.remove('loaded');
    }

    // Restart loading
    this.setLoadingState('loading');
    this.startImageLoading();
  }

  /**
   * Optimize image format based on browser support
   */
  optimizeImageFormat() {
    // Check for WebP support
    const supportsWebP = this.checkWebPSupport();
    
    if (!supportsWebP) {
      // Remove WebP sources if not supported
      const webpSources = document.querySelectorAll('.hero-section__picture source[type="image/webp"]');
      webpSources.forEach(source => source.remove());
    }

    // Check for AVIF support (future enhancement)
    const supportsAVIF = this.checkAVIFSupport();
    
    if (supportsAVIF) {
      console.log('AVIF format supported - could add AVIF sources');
    }
  }

  /**
   * Check WebP support
   */
  checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  checkAVIFSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Setup responsive image loading based on viewport
   */
  setupResponsiveLoading() {
    const updateImageSources = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      };

      // Adjust image quality based on connection
      if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.adjustImageQuality('low');
        } else if (connection.effectiveType === '3g') {
          this.adjustImageQuality('medium');
        } else {
          this.adjustImageQuality('high');
        }
      }

      // Log viewport info for debugging
      console.log('Viewport info:', viewport);
    };

    // Update on load and resize
    updateImageSources();
    this.addEventListener(window, 'resize', this.throttle(updateImageSources, 250));
  }

  /**
   * Adjust image quality based on connection
   */
  adjustImageQuality(quality) {
    const qualityMap = {
      low: 60,
      medium: 75,
      high: 85
    };

    const targetQuality = qualityMap[quality] || 80;
    console.log(`Adjusting image quality to: ${quality} (${targetQuality})`);

    // This would typically involve updating image URLs with quality parameters
    // For now, just log the adjustment
  }

  /**
   * Set loading state
   */
  setLoadingState(state) {
    this.loadingStates.set('hero', state);
    
    const imageContainer = this.getElement('imageContainer');
    if (imageContainer) {
      imageContainer.setAttribute('data-loading-state', state);
    }
  }

  /**
   * Get loading state
   */
  getLoadingState() {
    return this.loadingStates.get('hero') || 'idle';
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    return {
      state: this.getLoadingState(),
      retryAttempts: Array.from(this.retryAttempts.entries()),
      hasTimeout: !!this.loadingTimeout
    };
  }

  /**
   * Preload hero image for faster loading
   */
  preloadHeroImage(src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    // Add to head if not already present
    if (!document.querySelector(`link[href="${src}"]`)) {
      document.head.appendChild(link);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    super.destroy();
    
    // Clear timeouts
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    // Clear maps
    this.loadingStates.clear();
    this.retryAttempts.clear();
  }
}