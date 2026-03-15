import { GuidelineEntry } from '../../types';

/**
 * Code Optimization Guidelines
 * Minification and bundling guidelines for CSS and JavaScript optimization
 */

export const codeOptimizationGuidelines: GuidelineEntry = {
  id: 'performance-code-optimization',
  title: 'Code Optimization Guidelines',
  category: 'performance',
  priority: 'critical',
  description: 'Guidelines for optimizing CSS and JavaScript through minification, bundling, tree shaking, and efficient build processes.',
  rules: [
    {
      statement: 'Implement CSS and JavaScript minification in production builds',
      rationale: 'Minification removes unnecessary characters, comments, and whitespace, significantly reducing file sizes and improving load times.',
      implementation: 'Use build tools like Webpack, Rollup, or Vite with minification plugins. Configure different settings for development and production environments.',
      validation: {
        method: 'build-analysis',
        automated: true,
        tools: ['minification-checker', 'bundle-size-analyzer']
      }
    },

    {
      statement: 'Use tree shaking to eliminate unused code',
      rationale: 'Tree shaking removes dead code from bundles, reducing file sizes by excluding unused functions, classes, and imports.',
      implementation: 'Use ES6 modules, configure bundlers for tree shaking, mark side-effect-free packages, and avoid importing entire libraries when only specific functions are needed.',
      validation: {
        method: 'bundle-analysis',
        automated: true,
        tools: ['tree-shaking-analyzer', 'unused-code-detector']
      }
    },

    {
      statement: 'Implement code splitting for optimal loading',
      rationale: 'Code splitting allows loading only necessary code initially, with additional code loaded on demand, improving initial page load performance.',
      implementation: 'Split code by routes, features, or vendor libraries. Use dynamic imports and lazy loading for non-critical functionality.',
      validation: {
        method: 'performance-testing',
        automated: true,
        tools: ['code-splitting-analyzer', 'chunk-size-monitor']
      }
    },

    {
      statement: 'Optimize CSS delivery and eliminate render-blocking resources',
      rationale: 'Render-blocking CSS delays page rendering. Optimizing CSS delivery ensures faster visual rendering and better user experience.',
      implementation: 'Inline critical CSS, defer non-critical CSS, use media queries for conditional loading, and implement CSS preloading strategies.',
      validation: {
        method: 'render-performance-testing',
        automated: true,
        tools: ['critical-css-analyzer', 'render-blocking-detector']
      }
    },

    {
      statement: 'Use efficient JavaScript patterns and avoid performance anti-patterns',
      rationale: 'Efficient code patterns reduce execution time, memory usage, and improve overall application performance.',
      implementation: 'Avoid unnecessary DOM queries, use event delegation, implement debouncing/throttling, and optimize loops and data structures.',
      validation: {
        method: 'performance-profiling',
        automated: true,
        tools: ['js-performance-analyzer', 'memory-leak-detector']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Webpack Production Optimization Configuration',
      goodExample: `// Good: Comprehensive webpack optimization
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  entry: {
    main: './src/index.js',
    vendor: ['react', 'react-dom', 'lodash']
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    clean: true
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              convertValues: true,
              discardDuplicates: true
            }
          ]
        }
      })
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    runtimeChunk: 'single',
    
    // Tree shaking configuration
    usedExports: true,
    sideEffects: false
  },
  
  module: {
    rules: [
      {
        test: /\\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false, // Enable tree shaking
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      },
      
      {
        test: /\\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer',
                  'cssnano'
                ]
              }
            }
          }
        ]
      }
    ]
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].chunk.css'
    }),
    
    // Bundle analysis (conditional)
    process.env.ANALYZE && new BundleAnalyzerPlugin()
  ].filter(Boolean)
};`,
      badExample: `// Bad: No optimization
module.exports = {
  mode: 'development', // Wrong mode for production
  
  entry: './src/index.js',
  
  output: {
    filename: 'bundle.js' // No cache busting
  },
  
  // No optimization configuration
  // No minification
  // No code splitting
  // No tree shaking
  
  module: {
    rules: [
      {
        test: /\\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'] // Inlines all CSS
      }
    ]
  }
};`,
      explanation: 'The good example implements comprehensive optimization including minification, tree shaking, code splitting, and proper caching strategies. The bad example lacks optimization and uses development settings for production.'
    },

    {
      language: 'javascript',
      title: 'Tree Shaking and Dynamic Imports',
      goodExample: `// Good: Tree shaking friendly imports and dynamic loading
// utils.js - Export individual functions for tree shaking
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// main.js - Import only what you need
import { formatDate, debounce } from './utils.js'; // Tree shaking friendly

// Dynamic imports for code splitting
const loadDashboard = async () => {
  const { Dashboard } = await import('./components/Dashboard.js');
  return Dashboard;
};

const loadChartLibrary = async () => {
  // Load heavy library only when needed
  const chartLib = await import('chart.js');
  return chartLib.default;
};

// Feature-based code splitting
class FeatureLoader {
  static async loadFeature(featureName) {
    try {
      const module = await import(\`./features/\${featureName}/index.js\`);
      return module.default;
    } catch (error) {
      console.error(\`Failed to load feature: \${featureName}\`, error);
      return null;
    }
  }
}

// Conditional loading based on user interaction
document.getElementById('advanced-features').addEventListener('click', async () => {
  const advancedModule = await import('./advanced-features.js');
  advancedModule.initialize();
});`,
      badExample: `// Bad: Imports entire libraries and no code splitting
import * as utils from './utils.js'; // Imports everything
import _ from 'lodash'; // Entire library
import moment from 'moment'; // Heavy library loaded upfront

// All features loaded immediately
import Dashboard from './components/Dashboard.js';
import Chart from 'chart.js';
import AdvancedFeatures from './advanced-features.js';

// No dynamic loading
const app = {
  dashboard: new Dashboard(),
  chart: new Chart(),
  advanced: new AdvancedFeatures()
};`,
      explanation: 'The good example uses selective imports, dynamic loading, and code splitting to minimize bundle size. The bad example imports entire libraries and loads all features upfront, creating unnecessarily large bundles.'
    },

    {
      language: 'html',
      title: 'Critical CSS and Resource Optimization',
      goodExample: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimized Page</title>
  
  <!-- Critical CSS inlined -->
  <style>
    /* Critical above-the-fold styles */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .header { background: #fff; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .hero { min-height: 50vh; display: flex; align-items: center; justify-content: center; }
    .loading { opacity: 0; transition: opacity 0.3s; }
    .loaded { opacity: 1; }
  </style>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/js/critical.js" as="script">
  
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="//cdn.example.com">
  <link rel="dns-prefetch" href="//analytics.example.com">
  
  <!-- Non-critical CSS loaded asynchronously -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
  
  <!-- Critical JavaScript -->
  <script src="/js/critical.js" defer></script>
</head>
<body>
  <header class="header">
    <nav><!-- Navigation content --></nav>
  </header>
  
  <main class="hero loading" id="main-content">
    <h1>Welcome</h1>
  </main>
  
  <!-- Non-critical JavaScript loaded after page load -->
  <script>
    // Load non-critical resources after page load
    window.addEventListener('load', () => {
      // Mark content as loaded
      document.getElementById('main-content').classList.add('loaded');
      
      // Load non-critical JavaScript
      const scripts = [
        '/js/analytics.js',
        '/js/features.js',
        '/js/interactions.js'
      ];
      
      scripts.forEach((src, index) => {
        setTimeout(() => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
        }, index * 100); // Stagger loading
      });
    });
    
    // Service worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>
</body>
</html>`,
      badExample: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Unoptimized Page</title>
  
  <!-- All CSS loaded synchronously -->
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/features.css">
  <link rel="stylesheet" href="/css/admin.css">
  
  <!-- All JavaScript loaded in head (render blocking) -->
  <script src="/js/jquery.js"></script>
  <script src="/js/bootstrap.js"></script>
  <script src="/js/charts.js"></script>
  <script src="/js/admin.js"></script>
  <script src="/js/analytics.js"></script>
</head>
<body>
  <header>
    <nav><!-- Navigation content --></nav>
  </header>
  
  <main>
    <h1>Welcome</h1>
  </main>
</body>
</html>`,
      explanation: 'The good example implements critical CSS inlining, resource preloading, and progressive loading strategies to optimize rendering performance. The bad example loads all resources synchronously, blocking rendering and degrading performance.'
    },

    {
      language: 'javascript',
      title: 'Performance-Optimized JavaScript Patterns',
      goodExample: `// Good: Performance-optimized patterns
class PerformantComponent {
  constructor(element) {
    this.element = element;
    this.cache = new Map();
    this.observers = new Set();
    
    // Bind methods once
    this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
    this.handleResize = this.debounce(this.handleResize.bind(this), 250);
    
    this.init();
  }
  
  init() {
    // Use event delegation instead of multiple listeners
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // Throttled scroll handler
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Debounced resize handler
    window.addEventListener('resize', this.handleResize);
    
    // Intersection Observer for efficient visibility detection
    this.setupIntersectionObserver();
  }
  
  handleClick(event) {
    // Event delegation - handle multiple elements with one listener
    const target = event.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const handler = this[\`handle\${action.charAt(0).toUpperCase()}\${action.slice(1)}\`];
    
    if (handler) {
      handler.call(this, target, event);
    }
  }
  
  // Efficient DOM queries with caching
  querySelector(selector) {
    if (!this.cache.has(selector)) {
      this.cache.set(selector, this.element.querySelector(selector));
    }
    return this.cache.get(selector);
  }
  
  querySelectorAll(selector) {
    const cacheKey = \`all:\${selector}\`;
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, [...this.element.querySelectorAll(selector)]);
    }
    return this.cache.get(cacheKey);
  }
  
  // Efficient scroll handling
  handleScroll() {
    const scrollY = window.pageYOffset;
    
    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
      this.updateScrollEffects(scrollY);
    });
  }
  
  // Intersection Observer for performance
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleElementVisible(entry.target);
        } else {
          this.handleElementHidden(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
    
    this.querySelectorAll('[data-observe]').forEach(el => {
      observer.observe(el);
    });
    
    this.observers.add(observer);
  }
  
  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Cleanup to prevent memory leaks
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.cache.clear();
  }
}`,
      badExample: `// Bad: Performance anti-patterns
class UnoptimizedComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Anti-pattern: Multiple event listeners for similar elements
    this.element.querySelectorAll('.button').forEach(button => {
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });
    
    // Anti-pattern: No throttling on scroll
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });
    
    // Anti-pattern: No debouncing on resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Anti-pattern: Polling instead of Intersection Observer
    setInterval(() => {
      this.checkVisibility();
    }, 100);
  }
  
  handleScroll() {
    // Anti-pattern: Repeated DOM queries
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
    
    // Anti-pattern: Synchronous DOM manipulation in scroll handler
    document.querySelector('.header').style.transform = 
      \`translateY(\${window.pageYOffset * 0.5}px)\`;
  }
  
  checkVisibility() {
    // Anti-pattern: Expensive operations in polling
    document.querySelectorAll('[data-lazy]').forEach(el => {
      const rect = el.getBoundingClientRect();
      // Expensive calculations on every poll
    });
  }
  
  // No cleanup - memory leaks
}`,
      explanation: 'The good example uses performance-optimized patterns including event delegation, throttling/debouncing, DOM caching, Intersection Observer, and proper cleanup. The bad example demonstrates common anti-patterns that hurt performance.'
    }
  ],
  relatedGuidelines: [
    'performance-asset-optimization',
    'performance-responsive-design',
    'performance-monitoring'
  ]
};