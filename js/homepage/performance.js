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
    
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      Object.assign(link, resource);
      
      // Only add if not already present
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
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