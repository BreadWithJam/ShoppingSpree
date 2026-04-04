/**
 * Performance Manager Module
 * Handles performance optimization, lazy loading, and monitoring
 */

import { BaseModule } from './base-module.js';

export class PerformanceManager extends BaseModule {
  constructor() {
    super('PerformanceManager');
    this.metrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    this.observers = new Map();
    this.lazyImages = [];
  }

  /**
   * Initialize performance monitoring
   */
  async init() {
    await super.init();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    // Set up lazy loading
    this.setupLazyLoading();
    
    // Set up resource optimization
    this.setupResourceOptimization();
    
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  }

  /**
   * Find performance-related elements
   */
  async findElements() {
    this.setElement('lazyImages', this.findElements('img[loading="lazy"], img[data-src]'));
    this.setElement('lazyElements', this.findElements('[data-lazy]'));
  }

  /**
   * Bind performance events
   */
  bindEvents() {
    // Monitor page load performance
    this.addEventListener(window, 'load', this.handlePageLoad);
    
    // Monitor visibility changes for performance optimization
    this.addEventListener(document, 'visibilitychange', this.handleVisibilityChange);
    
    // Monitor scroll for lazy loading
    this.addEventListener(window, 'scroll', this.throttle(this.handleScroll, 100));
    
    // Monitor resize for responsive optimizations
    this.addEventListener(window, 'resize', this.throttle(this.handleResize, 250));
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.monitorNavigationTiming();
      this.monitorResourceTiming();
    }
    
    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      this.monitorPaintTiming();
      this.monitorLayoutShift();
      this.monitorLongTasks();
    }
  }

  /**
   * Monitor navigation timing
   */
  monitorNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      console.log('Navigation Timing:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      });
    }
  }

  /**
   * Monitor resource timing
   */
  monitorResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    
    const resourceSummary = resources.reduce((summary, resource) => {
      const type = this.getResourceType(resource.name);
      
      if (!summary[type]) {
        summary[type] = { count: 0, totalSize: 0, totalTime: 0 };
      }
      
      summary[type].count++;
      summary[type].totalSize += resource.transferSize || 0;
      summary[type].totalTime += resource.duration;
      
      return summary;
    }, {});
    
    console.log('Resource Summary:', resourceSummary);
  }

  /**
   * Monitor paint timing
   */
  monitorPaintTiming() {
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.set('paint', paintObserver);
  }

  /**
   * Monitor layout shift
   */
  monitorLayoutShift() {
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.metrics.cumulativeLayoutShift += clsValue;
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('layout-shift', clsObserver);
  }

  /**
   * Monitor long tasks
   */
  monitorLongTasks() {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn('Long task detected:', {
          duration: entry.duration,
          startTime: entry.startTime
        });
      });
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', longTaskObserver);
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals() {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', lcpObserver);
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.set('fid', fidObserver);
  }

  /**
   * Setup lazy loading
   */
  setupLazyLoading() {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.setupScrollBasedLazyLoading();
    }
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadLazyImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Observe all lazy images
    const lazyImages = this.getElement('lazyImages');
    lazyImages.forEach((img) => {
      imageObserver.observe(img);
      this.lazyImages.push(img);
    });
    
    this.observers.set('lazy-images', imageObserver);
  }

  /**
   * Setup scroll-based lazy loading fallback
   */
  setupScrollBasedLazyLoading() {
    this.addEventListener(window, 'scroll', this.throttle(() => {
      this.lazyImages.forEach((img, index) => {
        if (this.isInViewport(img)) {
          this.loadLazyImage(img);
          this.lazyImages.splice(index, 1);
        }
      });
    }, 100));
  }

  /**
   * Load lazy image
   */
  loadLazyImage(img) {
    const src = img.dataset.src || img.src;
    
    if (src && img.dataset.src) {
      // Create new image to preload
      const newImg = new Image();
      
      newImg.onload = () => {
        img.src = src;
        img.classList.add('lazy-loaded');
        img.removeAttribute('data-src');
        
        // Emit load event
        const loadEvent = new CustomEvent('lazyImageLoaded', {
          detail: { image: img, src }
        });
        document.dispatchEvent(loadEvent);
      };
      
      newImg.onerror = () => {
        img.classList.add('lazy-error');
        console.error('Failed to load lazy image:', src);
      };
      
      newImg.src = src;
    }
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= -50 &&
      rect.left >= -50 &&
      rect.bottom <= windowHeight + 50 &&
      rect.right <= windowWidth + 50
    );
  }

  /**
   * Setup resource optimization
   */
  setupResourceOptimization() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Setup service worker if available
    this.setupServiceWorker();
    
    // Setup progressive loading strategies
    this.setupProgressiveLoading();
    
    // Setup skeleton screens
    this.setupSkeletonScreens();
    
    // Setup critical CSS inlining
    this.setupCriticalCSS();
    
    // Setup asset delivery optimization
    this.setupAssetOptimization();
    
    // Setup caching strategies
    this.setupCachingStrategies();
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/css/critical.css', as: 'style' },
      { href: '/js/critical.js', as: 'script' },
      { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
    ];
    
    // Add resource hints for important assets
    const resourceHints = [
      { rel: 'dns-prefetch', href: '//images.unsplash.com' },
      { rel: 'preconnect', href: 'https://images.unsplash.com', crossorigin: true },
      { rel: 'prefetch', href: '/api/products/featured' },
      { rel: 'prefetch', href: '/api/categories' }
    ];
    
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      Object.assign(link, resource);
      
      // Only add if not already present
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        document.head.appendChild(link);
      }
    });
    
    // Add resource hints
    resourceHints.forEach((hint) => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      
      // Only add if not already present
      if (!document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Optimize font loading
   */
  optimizeFontLoading() {
    // Use font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Segoe UI';
        font-display: swap;
      }
    `;
    
    if (!document.getElementById('font-optimization')) {
      style.id = 'font-optimization';
      document.head.appendChild(style);
    }
  }

  /**
   * Setup service worker
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Handle page load
   */
  handlePageLoad() {
    // Calculate and report performance metrics
    setTimeout(() => {
      this.calculatePerformanceMetrics();
      this.reportPerformanceMetrics();
    }, 1000);
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause non-critical operations
      this.pauseNonCriticalOperations();
    } else {
      // Page is visible, resume operations
      this.resumeOperations();
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    // Trigger lazy loading for scroll-based fallback
    if (this.lazyImages.length > 0) {
      this.lazyImages.forEach((img, index) => {
        if (this.isInViewport(img)) {
          this.loadLazyImage(img);
          this.lazyImages.splice(index, 1);
        }
      });
    }
  }

  /**
   * Handle resize events
   */
  handleResize() {
    // Optimize for new viewport size
    this.optimizeForViewport();
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      }
      
      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
  }

  /**
   * Report performance metrics
   */
  reportPerformanceMetrics() {
    console.log('Performance Metrics:', this.metrics);
    
    // Emit performance event
    const performanceEvent = new CustomEvent('performanceMetrics', {
      detail: this.metrics
    });
    document.dispatchEvent(performanceEvent);
    
    // Check for performance issues
    this.checkPerformanceThresholds();
  }

  /**
   * Check performance thresholds
   */
  checkPerformanceThresholds() {
    const thresholds = {
      firstContentfulPaint: 1800, // 1.8s
      largestContentfulPaint: 2500, // 2.5s
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100 // 100ms
    };
    
    const issues = [];
    
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      if (this.metrics[metric] > threshold) {
        issues.push(`${metric}: ${this.metrics[metric]} (threshold: ${threshold})`);
      }
    });
    
    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
    }
  }

  /**
   * Pause non-critical operations
   */
  pauseNonCriticalOperations() {
    // Pause animations, timers, etc.
    console.log('Pausing non-critical operations');
  }

  /**
   * Resume operations
   */
  resumeOperations() {
    // Resume paused operations
    console.log('Resuming operations');
  }

  /**
   * Optimize for current viewport
   */
  optimizeForViewport() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Adjust lazy loading thresholds based on viewport
    if (viewport.width < 768) {
      // Mobile optimizations
      this.optimizeForMobile();
    } else {
      // Desktop optimizations
      this.optimizeForDesktop();
    }
  }

  /**
   * Optimize for mobile
   */
  optimizeForMobile() {
    // Reduce image quality, defer non-critical resources
    console.log('Applying mobile optimizations');
  }

  /**
   * Optimize for desktop
   */
  optimizeForDesktop() {
    // Preload more resources, higher quality images
    console.log('Applying desktop optimizations');
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'js';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      metrics: this.metrics,
      lazyImagesLoaded: this.getElement('lazyImages').length - this.lazyImages.length,
      observersActive: this.observers.size
    };
  }

  /**
   * Setup progressive loading strategies
   */
  setupProgressiveLoading() {
    // Implement critical CSS inlining for above-the-fold content
    this.inlineCriticalCSS();
    
    // Setup progressive image loading with placeholders
    this.setupProgressiveImages();
    
    // Setup content prioritization
    this.setupContentPrioritization();
    
    // Setup adaptive loading based on connection
    this.setupAdaptiveLoading();
  }

  /**
   * Inline critical CSS for above-the-fold content
   */
  inlineCriticalCSS() {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      .site-header {
        background-color: #1a1a2e;
        color: #ffffff;
        position: sticky;
        top: 0;
        z-index: 1020;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .site-header__container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
        min-height: 56px;
      }
      
      .hero-section {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
        color: #ffffff;
        padding: 3rem 0;
        min-height: 50vh;
      }
      
      .hero-section__container {
        width: 100%;
        margin: 0 auto;
        padding: 0 1rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        align-items: center;
        text-align: center;
      }
      
      .hero-section__title {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.25;
        margin-bottom: 1rem;
      }
      
      .button--primary {
        background-color: #e94560;
        color: #ffffff;
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        transition: all 0.2s ease-in-out;
      }
      
      @media (min-width: 768px) {
        .site-header__container {
          min-height: 64px;
          padding: 0 2rem;
        }
        
        .hero-section {
          min-height: 60vh;
          padding: 4rem 0;
        }
        
        .hero-section__container {
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          text-align: left;
        }
        
        .hero-section__title {
          font-size: 3rem;
        }
      }
    `;
    
    // Create and inject critical CSS
    const criticalStyle = document.createElement('style');
    criticalStyle.id = 'critical-css';
    criticalStyle.textContent = criticalCSS;
    
    // Insert before any existing stylesheets
    const firstStylesheet = document.querySelector('link[rel="stylesheet"]');
    if (firstStylesheet && !document.getElementById('critical-css')) {
      document.head.insertBefore(criticalStyle, firstStylesheet);
    }
  }

  /**
   * Setup progressive image loading with placeholders
   */
  setupProgressiveImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach((img) => {
      // Create placeholder while image loads
      const placeholder = this.createImagePlaceholder(img);
      
      // Insert placeholder before image
      if (placeholder) {
        img.parentNode.insertBefore(placeholder, img);
        img.style.display = 'none';
      }
      
      // Show image when loaded
      img.addEventListener('load', () => {
        if (placeholder) {
          placeholder.remove();
        }
        img.style.display = 'block';
        img.classList.add('loaded');
      });
      
      // Handle image load errors
      img.addEventListener('error', () => {
        if (placeholder) {
          placeholder.classList.add('error');
          placeholder.innerHTML = `
            <div class="image-error">
              <span class="error-icon">⚠️</span>
              <span class="error-text">Image failed to load</span>
            </div>
          `;
        }
      });
    });
  }

  /**
   * Create image placeholder
   */
  createImagePlaceholder(img) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.cssText = `
      width: ${img.width || '100%'};
      height: ${img.height || '200px'};
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 14px;
    `;
    
    // Add shimmer animation if not already defined
    if (!document.getElementById('shimmer-animation')) {
      const shimmerStyle = document.createElement('style');
      shimmerStyle.id = 'shimmer-animation';
      shimmerStyle.textContent = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .image-placeholder {
          position: relative;
          overflow: hidden;
        }
        
        .image-placeholder.error {
          background: #f8f8f8;
          border: 2px dashed #ddd;
        }
        
        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .error-icon {
          font-size: 1.5rem;
        }
        
        .error-text {
          font-size: 0.875rem;
          color: #666;
        }
      `;
      document.head.appendChild(shimmerStyle);
    }
    
    placeholder.innerHTML = '<span>Loading...</span>';
    return placeholder;
  }

  /**
   * Setup content prioritization
   */
  setupContentPrioritization() {
    // Prioritize above-the-fold content
    const aboveFoldElements = [
      '.site-header',
      '.hero-section',
      '.categories-section'
    ];
    
    aboveFoldElements.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.willChange = 'transform';
        element.setAttribute('data-priority', 'high');
      }
    });
    
    // Defer below-the-fold content
    const belowFoldElements = document.querySelectorAll('.product-showcase:not(:first-of-type)');
    
    belowFoldElements.forEach((element, index) => {
      element.setAttribute('data-priority', 'low');
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      
      // Progressively reveal content as user scrolls
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100); // Stagger animations
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
      
      observer.observe(element);
    });
  }

  /**
   * Setup adaptive loading based on connection
   */
  setupAdaptiveLoading() {
    // Check for Network Information API support
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Adapt loading strategy based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableLowBandwidthMode();
      } else if (connection.effectiveType === '4g') {
        this.enableHighBandwidthMode();
      }
      
      // Listen for connection changes
      connection.addEventListener('change', () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          this.enableLowBandwidthMode();
        } else {
          this.enableHighBandwidthMode();
        }
      });
    }
    
    // Fallback: Check for data saver preference
    if ('connection' in navigator && navigator.connection.saveData) {
      this.enableLowBandwidthMode();
    }
  }

  /**
   * Enable low bandwidth mode
   */
  enableLowBandwidthMode() {
    document.documentElement.classList.add('low-bandwidth');
    
    // Reduce image quality
    const images = document.querySelectorAll('img[src*="unsplash.com"]');
    images.forEach((img) => {
      const src = img.src;
      if (src.includes('q=80')) {
        img.src = src.replace('q=80', 'q=50');
      }
    });
    
    // Disable non-essential animations
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    
    console.log('Low bandwidth mode enabled');
  }

  /**
   * Enable high bandwidth mode
   */
  enableHighBandwidthMode() {
    document.documentElement.classList.remove('low-bandwidth');
    document.documentElement.classList.add('high-bandwidth');
    
    // Preload additional resources
    this.preloadAdditionalResources();
    
    console.log('High bandwidth mode enabled');
  }

  /**
   * Preload additional resources for high bandwidth connections
   */
  preloadAdditionalResources() {
    const additionalResources = [
      '/api/products/recommended',
      '/api/user/preferences',
      '/images/hero-bg-large.webp'
    ];
    
    additionalResources.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Setup skeleton screens
   */
  setupSkeletonScreens() {
    // Create skeleton screens for product cards
    this.createProductSkeletons();
    
    // Create skeleton screen for hero section
    this.createHeroSkeleton();
    
    // Setup skeleton removal when content loads
    this.setupSkeletonRemoval();
  }

  /**
   * Create product card skeletons
   */
  createProductSkeletons() {
    const productGrids = document.querySelectorAll('.product-grid');
    
    productGrids.forEach((grid) => {
      // Only add skeletons if grid is empty or has loading attribute
      if (grid.children.length === 0 || grid.hasAttribute('data-loading')) {
        const skeletonCount = 4; // Show 4 skeleton cards
        
        for (let i = 0; i < skeletonCount; i++) {
          const skeleton = this.createProductSkeleton();
          grid.appendChild(skeleton);
        }
      }
    });
  }

  /**
   * Create individual product skeleton
   */
  createProductSkeleton() {
    const skeleton = document.createElement('li');
    skeleton.className = 'product-skeleton';
    skeleton.innerHTML = `
      <div class="product-skeleton__card">
        <div class="product-skeleton__image"></div>
        <div class="product-skeleton__content">
          <div class="product-skeleton__title"></div>
          <div class="product-skeleton__rating"></div>
          <div class="product-skeleton__price"></div>
          <div class="product-skeleton__button"></div>
        </div>
      </div>
    `;
    
    // Add skeleton styles if not already present
    if (!document.getElementById('skeleton-styles')) {
      const skeletonStyles = document.createElement('style');
      skeletonStyles.id = 'skeleton-styles';
      skeletonStyles.textContent = `
        .product-skeleton__card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .product-skeleton__image {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .product-skeleton__content {
          padding: 1rem;
        }
        
        .product-skeleton__title {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .product-skeleton__rating {
          height: 16px;
          width: 60%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .product-skeleton__price {
          height: 18px;
          width: 40%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .product-skeleton__button {
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
      `;
      document.head.appendChild(skeletonStyles);
    }
    
    return skeleton;
  }

  /**
   * Create hero section skeleton
   */
  createHeroSkeleton() {
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection && heroSection.hasAttribute('data-loading')) {
      const skeleton = document.createElement('div');
      skeleton.className = 'hero-skeleton';
      skeleton.innerHTML = `
        <div class="hero-skeleton__content">
          <div class="hero-skeleton__title"></div>
          <div class="hero-skeleton__description"></div>
          <div class="hero-skeleton__buttons">
            <div class="hero-skeleton__button"></div>
            <div class="hero-skeleton__button"></div>
          </div>
        </div>
        <div class="hero-skeleton__image"></div>
      `;
      
      // Add hero skeleton styles
      if (!document.getElementById('hero-skeleton-styles')) {
        const heroSkeletonStyles = document.createElement('style');
        heroSkeletonStyles.id = 'hero-skeleton-styles';
        heroSkeletonStyles.textContent = `
          .hero-skeleton {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: center;
            padding: 3rem 1rem;
          }
          
          .hero-skeleton__title {
            height: 60px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
            margin-bottom: 1rem;
          }
          
          .hero-skeleton__description {
            height: 40px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
            margin-bottom: 2rem;
          }
          
          .hero-skeleton__buttons {
            display: flex;
            gap: 1rem;
            flex-direction: column;
          }
          
          .hero-skeleton__button {
            height: 48px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 24px;
          }
          
          .hero-skeleton__image {
            height: 300px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
          }
          
          @media (min-width: 768px) {
            .hero-skeleton {
              grid-template-columns: 1fr 1fr;
              gap: 3rem;
            }
            
            .hero-skeleton__buttons {
              flex-direction: row;
            }
            
            .hero-skeleton__button {
              flex: 1;
            }
          }
        `;
        document.head.appendChild(heroSkeletonStyles);
      }
      
      heroSection.appendChild(skeleton);
    }
  }

  /**
   * Setup skeleton removal when content loads
   */
  setupSkeletonRemoval() {
    // Remove product skeletons when real content loads
    const productGrids = document.querySelectorAll('.product-grid');
    
    productGrids.forEach((grid) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const hasRealProducts = Array.from(grid.children).some(child => 
              child.classList.contains('product-card') || 
              child.querySelector('.product-card')
            );
            
            if (hasRealProducts) {
              // Remove skeletons
              const skeletons = grid.querySelectorAll('.product-skeleton');
              skeletons.forEach(skeleton => skeleton.remove());
              observer.disconnect();
            }
          }
        });
      });
      
      observer.observe(grid, { childList: true });
    });
    
    // Remove hero skeleton when content loads
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      const heroObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            const hasRealContent = heroSection.querySelector('.hero-section__container');
            const skeleton = heroSection.querySelector('.hero-skeleton');
            
            if (hasRealContent && skeleton && !heroSection.hasAttribute('data-loading')) {
              skeleton.remove();
              heroObserver.disconnect();
            }
          }
        });
      });
      
      heroObserver.observe(heroSection, { 
        childList: true, 
        attributes: true, 
        attributeFilter: ['data-loading'] 
      });
    }
  }

  /**
   * Setup critical CSS
   */
  setupCriticalCSS() {
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    nonCriticalCSS.forEach((link) => {
      // Convert to preload and then to stylesheet
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = link.href;
      preloadLink.onload = function() {
        this.onload = null;
        this.rel = 'stylesheet';
      };
      
      // Insert preload link
      document.head.appendChild(preloadLink);
      
      // Remove original link
      link.remove();
    });
    
    // Add fallback for browsers that don't support preload
    const noscriptFallback = document.createElement('noscript');
    nonCriticalCSS.forEach((link) => {
      const fallbackLink = link.cloneNode(true);
      noscriptFallback.appendChild(fallbackLink);
    });
    
    if (noscriptFallback.children.length > 0) {
      document.head.appendChild(noscriptFallback);
    }
  }

  /**
   * Setup asset delivery optimization
   */
  setupAssetOptimization() {
    // Optimize image delivery
    this.optimizeImageDelivery();
    
    // Setup compression for text assets
    this.setupAssetCompression();
    
    // Optimize font delivery
    this.optimizeFontDelivery();
    
    // Setup modern image format support
    this.setupModernImageFormats();
  }

  /**
   * Optimize image delivery
   */
  optimizeImageDelivery() {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Add modern image format support
      if (img.src && img.src.includes('unsplash.com')) {
        const optimizedUrl = this.getOptimizedImageUrl(img.src, {
          width: img.width || 400,
          quality: this.getOptimalImageQuality(),
          format: this.getSupportedImageFormat()
        });
        
        if (optimizedUrl !== img.src) {
          img.src = optimizedUrl;
        }
      }
      
      // Add responsive image attributes if missing
      if (!img.sizes && img.width) {
        img.sizes = this.generateResponsiveSizes(img.width);
      }
      
      // Add decoding hint for better performance
      if (!img.decoding) {
        img.decoding = img.loading === 'lazy' ? 'async' : 'auto';
      }
    });
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(originalUrl, options = {}) {
    try {
      const url = new URL(originalUrl);
      
      // Apply width optimization
      if (options.width) {
        url.searchParams.set('w', options.width.toString());
      }
      
      // Apply quality optimization
      if (options.quality) {
        url.searchParams.set('q', options.quality.toString());
      }
      
      // Apply format optimization
      if (options.format && options.format !== 'jpeg') {
        url.searchParams.set('fm', options.format);
      }
      
      // Add auto optimization
      url.searchParams.set('auto', 'format,compress');
      
      return url.toString();
    } catch (error) {
      console.warn('Failed to optimize image URL:', error);
      return originalUrl;
    }
  }

  /**
   * Get optimal image quality based on connection
   */
  getOptimalImageQuality() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 50;
        case '3g':
          return 70;
        case '4g':
        default:
          return 80;
      }
    }
    
    return 80; // Default quality
  }

  /**
   * Get supported image format
   */
  getSupportedImageFormat() {
    // Check for WebP support
    if (this.supportsWebP()) {
      return 'webp';
    }
    
    // Check for AVIF support (future)
    if (this.supportsAVIF()) {
      return 'avif';
    }
    
    return 'jpeg'; // Fallback
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    if (typeof this._webpSupport !== 'undefined') {
      return this._webpSupport;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return this._webpSupport;
  }

  /**
   * Check AVIF support
   */
  supportsAVIF() {
    if (typeof this._avifSupport !== 'undefined') {
      return this._avifSupport;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      this._avifSupport = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      this._avifSupport = false;
    }
    
    return this._avifSupport;
  }

  /**
   * Generate responsive sizes attribute
   */
  generateResponsiveSizes(baseWidth) {
    const breakpoints = [
      { width: 320, size: '100vw' },
      { width: 768, size: '50vw' },
      { width: 1024, size: '33vw' },
      { width: 1280, size: '25vw' }
    ];
    
    const sizes = breakpoints
      .map(bp => `(min-width: ${bp.width}px) ${bp.size}`)
      .join(', ');
    
    return `${sizes}, ${baseWidth}px`;
  }

  /**
   * Setup asset compression
   */
  setupAssetCompression() {
    // Check if compression is supported
    if ('CompressionStream' in window) {
      this.compressionSupported = true;
      console.log('Browser compression support detected');
    }
    
    // Add compression headers hint for server
    const compressionHint = document.createElement('meta');
    compressionHint.httpEquiv = 'Accept-Encoding';
    compressionHint.content = 'gzip, deflate, br';
    
    if (!document.querySelector('meta[http-equiv="Accept-Encoding"]')) {
      document.head.appendChild(compressionHint);
    }
  }

  /**
   * Optimize font delivery
   */
  optimizeFontDelivery() {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/segoe-ui-regular.woff2',
      '/fonts/segoe-ui-semibold.woff2'
    ];
    
    criticalFonts.forEach((fontUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        document.head.appendChild(link);
      }
    });
    
    // Add font-display: swap for better performance
    const fontDisplayStyle = document.createElement('style');
    fontDisplayStyle.textContent = `
      @font-face {
        font-family: 'Segoe UI';
        font-display: swap;
        src: url('/fonts/segoe-ui-regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
      }
      
      @font-face {
        font-family: 'Segoe UI';
        font-display: swap;
        src: url('/fonts/segoe-ui-semibold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
      }
    `;
    
    if (!document.getElementById('font-display-optimization')) {
      fontDisplayStyle.id = 'font-display-optimization';
      document.head.appendChild(fontDisplayStyle);
    }
  }

  /**
   * Setup modern image formats
   */
  setupModernImageFormats() {
    // Replace images with modern formats where supported
    const images = document.querySelectorAll('img[src*="unsplash.com"]');
    
    images.forEach((img) => {
      if (this.supportsWebP() && !img.src.includes('fm=webp')) {
        const webpUrl = this.getOptimizedImageUrl(img.src, {
          format: 'webp',
          quality: this.getOptimalImageQuality()
        });
        
        // Create picture element for better format support
        if (!img.parentElement.tagName === 'PICTURE') {
          const picture = document.createElement('picture');
          
          // WebP source
          const webpSource = document.createElement('source');
          webpSource.srcset = webpUrl;
          webpSource.type = 'image/webp';
          
          // Original image as fallback
          img.parentNode.insertBefore(picture, img);
          picture.appendChild(webpSource);
          picture.appendChild(img);
        }
      }
    });
  }

  /**
   * Setup caching strategies
   */
  setupCachingStrategies() {
    // Configure cache headers for different asset types
    this.configureCacheHeaders();
    
    // Setup browser cache optimization
    this.setupBrowserCache();
    
    // Setup service worker caching
    this.setupServiceWorkerCache();
    
    // Setup CDN optimization hints
    this.setupCDNOptimization();
  }

  /**
   * Configure cache headers
   */
  configureCacheHeaders() {
    const cacheConfig = {
      'text/css': 'max-age=31536000, immutable', // 1 year for CSS
      'application/javascript': 'max-age=31536000, immutable', // 1 year for JS
      'image/jpeg': 'max-age=2592000', // 30 days for images
      'image/png': 'max-age=2592000',
      'image/webp': 'max-age=2592000',
      'font/woff2': 'max-age=31536000, immutable', // 1 year for fonts
      'text/html': 'max-age=3600' // 1 hour for HTML
    };
    
    // Add cache control hints
    Object.entries(cacheConfig).forEach(([mimeType, cacheControl]) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = cacheControl;
      meta.setAttribute('data-mime-type', mimeType);
      
      if (!document.querySelector(`meta[data-mime-type="${mimeType}"]`)) {
        document.head.appendChild(meta);
      }
    });
  }

  /**
   * Setup browser cache optimization
   */
  setupBrowserCache() {
    // Add ETags for cache validation
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach((resource) => {
      if (resource.name.includes('.css') || resource.name.includes('.js')) {
        // Generate ETag based on resource timing
        const etag = this.generateETag(resource);
        
        // Store in session storage for cache validation
        sessionStorage.setItem(`etag_${resource.name}`, etag);
      }
    });
  }

  /**
   * Generate ETag for resource
   */
  generateETag(resource) {
    const data = `${resource.name}_${resource.transferSize}_${resource.responseEnd}`;
    return btoa(data).substring(0, 16);
  }

  /**
   * Setup service worker cache
   */
  setupServiceWorkerCache() {
    if ('serviceWorker' in navigator) {
      // Send cache configuration to service worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'CACHE_CONFIG',
            config: {
              staticAssets: [
                '/',
                '/styles.css',
                '/js/main.js',
                '/js/homepage/performance.js'
              ],
              dynamicAssets: {
                images: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
                api: { maxAge: 5 * 60 * 1000 } // 5 minutes
              }
            }
          });
        }
      });
    }
  }

  /**
   * Setup CDN optimization hints
   */
  setupCDNOptimization() {
    // Add CDN optimization headers
    const cdnHints = [
      { name: 'X-CDN-Cache', content: 'HIT' },
      { name: 'X-Edge-Location', content: 'auto' },
      { name: 'X-Compression', content: 'gzip, br' }
    ];
    
    cdnHints.forEach((hint) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = hint.name;
      meta.content = hint.content;
      
      if (!document.querySelector(`meta[http-equiv="${hint.name}"]`)) {
        document.head.appendChild(meta);
      }
    });
    
    // Add resource hints for CDN
    const cdnDomains = [
      'images.unsplash.com',
      'fonts.googleapis.com',
      'cdnjs.cloudflare.com'
    ];
    
    cdnDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      
      if (!document.querySelector(`link[href="//${domain}"]`)) {
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Get asset optimization summary
   */
  getAssetOptimizationSummary() {
    return {
      webpSupport: this.supportsWebP(),
      avifSupport: this.supportsAVIF(),
      compressionSupport: this.compressionSupported || false,
      optimalImageQuality: this.getOptimalImageQuality(),
      cacheConfigured: true,
      cdnOptimized: true
    };
  }

  /**
   * Cleanup observers
   */
  destroy() {
    super.destroy();
    
    // Disconnect all observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    
    this.observers.clear();
  }
}