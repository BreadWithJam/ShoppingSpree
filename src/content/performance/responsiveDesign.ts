import { GuidelineEntry } from '../../types';

/**
 * Responsive Design Guidelines
 * Mobile-first and progressive enhancement approaches for optimal performance
 */

export const responsiveDesignGuidelines: GuidelineEntry = {
  id: 'performance-responsive-design',
  title: 'Responsive Design Guidelines',
  category: 'performance',
  priority: 'critical',
  description: 'Guidelines for implementing mobile-first responsive design and progressive enhancement to ensure optimal performance across all devices.',
  rules: [
    {
      statement: 'Use mobile-first approach for CSS media queries',
      rationale: 'Mobile-first design ensures the base styles are optimized for smaller screens and slower connections, with enhancements added for larger screens.',
      implementation: 'Write base styles for mobile devices, then use min-width media queries to add styles for larger screens progressively.',
      validation: {
        method: 'responsive-testing',
        automated: true,
        tools: ['responsive-design-checker', 'mobile-performance-audit']
      }
    },

    {
      statement: 'Implement fluid layouts using relative units',
      rationale: 'Fluid layouts adapt smoothly to different screen sizes without requiring specific breakpoints for every device.',
      implementation: 'Use percentages, viewport units (vw, vh), and em/rem units instead of fixed pixel values for layout dimensions.',
      validation: {
        method: 'cross-device-testing',
        automated: true,
        tools: ['layout-flexibility-tester']
      }
    },

    {
      statement: 'Use CSS Grid and Flexbox for responsive layouts',
      rationale: 'Modern CSS layout methods provide better performance and flexibility compared to float-based or table-based layouts.',
      implementation: 'Implement CSS Grid for two-dimensional layouts and Flexbox for one-dimensional layouts. Use auto-fit and auto-fill for responsive grids.',
      validation: {
        method: 'layout-performance-testing',
        automated: true,
        tools: ['css-layout-analyzer']
      }
    },

    {
      statement: 'Optimize touch targets for mobile interaction',
      rationale: 'Properly sized touch targets improve usability and reduce user frustration on touch devices.',
      implementation: 'Ensure interactive elements are at least 44px × 44px, provide adequate spacing between touch targets, and use appropriate hover states.',
      validation: {
        method: 'accessibility-audit',
        automated: true,
        tools: ['touch-target-checker']
      }
    },

    {
      statement: 'Implement progressive enhancement for advanced features',
      rationale: 'Progressive enhancement ensures core functionality works on all devices while providing enhanced experiences on capable devices.',
      implementation: 'Start with basic HTML/CSS functionality, then enhance with JavaScript and advanced CSS features using feature detection.',
      validation: {
        method: 'feature-support-testing',
        automated: true,
        tools: ['progressive-enhancement-tester']
      }
    }
  ],
  examples: [
    {
      language: 'css',
      title: 'Mobile-First Responsive CSS',
      goodExample: `/* Good: Mobile-first approach */
.container {
  /* Base styles for mobile */
  width: 100%;
  padding: 1rem;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.card {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Tablet styles */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 2rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}`,
      badExample: `/* Bad: Desktop-first approach */
.container {
  /* Desktop styles as base */
  width: 1200px;
  padding: 3rem;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* Tablet styles */
@media (max-width: 1024px) {
  .container {
    width: 768px;
    padding: 2rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}`,
      explanation: 'The good example starts with mobile styles and progressively enhances for larger screens, ensuring optimal performance on mobile devices. The bad example requires overriding desktop styles for smaller screens.'
    },

    {
      language: 'css',
      title: 'Fluid Typography and Spacing',
      goodExample: `/* Good: Fluid typography using clamp() */
:root {
  /* Fluid font sizes */
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  
  /* Fluid spacing */
  --space-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-sm: clamp(0.75rem, 0.6rem + 0.75vw, 1rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  --space-xl: clamp(2rem, 1.5rem + 2.5vw, 4rem);
}

.heading {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
  line-height: 1.2;
}

.content {
  font-size: var(--font-size-base);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

/* Container with fluid max-width */
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}`,
      badExample: `/* Bad: Fixed typography and spacing */
.heading {
  font-size: 36px; /* Fixed size */
  margin-bottom: 24px;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.container {
  width: 1200px; /* Fixed width */
  margin: 0 auto;
}

@media (max-width: 768px) {
  .heading {
    font-size: 24px; /* Abrupt size change */
  }
  
  .container {
    width: 100%;
    padding: 0 16px;
  }
}`,
      explanation: 'The good example uses fluid typography with clamp() for smooth scaling and CSS custom properties for consistent spacing. The bad example uses fixed sizes that create abrupt changes at breakpoints.'
    },

    {
      language: 'css',
      title: 'Responsive Grid Layout',
      goodExample: `/* Good: Auto-responsive grid */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(1rem, 2vw, 2rem);
}

.grid-responsive {
  display: grid;
  gap: 1rem;
  
  /* Mobile: single column */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  /* Desktop: 3 columns with sidebar */
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
  
  /* Large desktop: 4 columns */
  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Flexible card component */
.card {
  container-type: inline-size;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-content {
  padding: 1rem;
}

/* Container queries for card variations */
@container (min-width: 300px) {
  .card-content {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1.25rem;
  }
}`,
      badExample: `/* Bad: Rigid grid system */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* Always 12 columns */
  gap: 16px;
}

.col-4 {
  grid-column: span 4;
}

.col-6 {
  grid-column: span 6;
}

.col-12 {
  grid-column: span 12;
}

@media (max-width: 768px) {
  .col-4,
  .col-6 {
    grid-column: span 12; /* Everything full width on mobile */
  }
}`,
      explanation: 'The good example uses flexible grid systems that adapt automatically to content and screen size, including modern container queries. The bad example relies on a rigid 12-column system that requires manual overrides.'
    },

    {
      language: 'javascript',
      title: 'Progressive Enhancement with Feature Detection',
      goodExample: `// Good: Progressive enhancement with feature detection
class ResponsiveComponent {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Base functionality that works everywhere
    this.setupBasicInteraction();
    
    // Enhanced features with feature detection
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    }
    
    if ('ResizeObserver' in window) {
      this.setupResponsiveUpdates();
    }
    
    if (CSS.supports('container-type', 'inline-size')) {
      this.element.classList.add('supports-container-queries');
    }
    
    // Touch device enhancements
    if ('ontouchstart' in window) {
      this.setupTouchInteractions();
    }
  }
  
  setupBasicInteraction() {
    // Works on all devices
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  setupLazyLoading() {
    const images = this.element.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  setupResponsiveUpdates() {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width } = entry.contentRect;
        this.updateLayout(width);
      });
    });
    
    resizeObserver.observe(this.element);
  }
  
  setupTouchInteractions() {
    // Enhanced touch interactions
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
  }
}`,
      badExample: `// Bad: Assumes all features are available
class ResponsiveComponent {
  constructor(element) {
    this.element = element;
    
    // Assumes IntersectionObserver is available
    this.observer = new IntersectionObserver(this.handleIntersection);
    
    // Assumes ResizeObserver is available
    this.resizeObserver = new ResizeObserver(this.handleResize);
    
    // No feature detection
    this.element.style.containerType = 'inline-size';
    
    this.init();
  }
}`,
      explanation: 'The good example uses feature detection to progressively enhance functionality, ensuring the component works on all devices. The bad example assumes modern features are available, potentially breaking on older devices.'
    }
  ],
  relatedGuidelines: [
    'performance-asset-optimization',
    'performance-media-handling',
    'accessibility-compliance'
  ]
};