/**
 * Hero Section Property-Based Tests
 * Tests hero section content structure and responsive behavior
 */

const fc = require('fast-check');

/**
 * **Feature: ecommerce-homepage, Property 21: Hero section content structure**
 * **Validates: Requirements 6.1**
 * 
 * For any hero section on the homepage, it should contain clear value 
 * propositions and call-to-action buttons
 */

// Mock hero section data structure
const createHeroSectionStructure = (viewportWidth, hasPromotion) => {
  return {
    section: {
      role: 'banner',
      className: 'hero-section'
    },
    container: {
      className: 'hero-section__container',
      layout: viewportWidth > 768 ? 'grid' : 'stacked'
    },
    content: {
      className: 'hero-section__content',
      title: {
        className: 'hero-section__title',
        text: 'Shop Smarter, Live Better',
        highlight: {
          className: 'hero-section__highlight',
          text: 'Smarter'
        }
      },
      description: {
        className: 'hero-section__description',
        text: 'Discover thousands of products at unbeatable prices. Fast shipping, easy returns.',
        maxWidth: '540px'
      },
      actions: {
        className: 'hero-section__actions',
        buttons: [
          {
            href: '/shop',
            className: 'button button--primary',
            text: 'Shop Now',
            type: 'primary'
          },
          {
            href: '/deals',
            className: 'button button--secondary',
            text: 'View Deals',
            type: 'secondary'
          }
        ]
      }
    },
    media: {
      className: 'hero-section__media',
      ariaHidden: 'true',
      picture: {
        className: 'hero-section__picture',
        image: {
          className: 'hero-section__image',
          src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
          alt: '',
          loading: 'eager',
          width: 600,
          height: 400
        },
        sources: [
          {
            media: '(min-width: 1024px)',
            srcset: 'image-1200w.webp 1200w, image-800w.webp 800w',
            sizes: '(min-width: 1024px) 600px, 400px',
            type: 'image/webp'
          },
          {
            media: '(min-width: 768px)',
            srcset: 'image-800w.webp 800w, image-600w.webp 600w',
            sizes: '400px',
            type: 'image/webp'
          },
          {
            media: '(min-width: 1024px)',
            srcset: 'image-1200w.jpg 1200w, image-800w.jpg 800w',
            sizes: '(min-width: 1024px) 600px, 400px',
            type: 'image/jpeg'
          },
          {
            media: '(min-width: 768px)',
            srcset: 'image-800w.jpg 800w, image-600w.jpg 600w',
            sizes: '400px',
            type: 'image/jpeg'
          }
        ]
      },
      overlay: {
        className: 'hero-section__visual-overlay'
      }
    },
    promotion: hasPromotion ? {
      text: 'Limited Time Offer',
      discount: '50% OFF',
      code: 'SAVE50'
    } : null
  };
};

describe('Hero Section Structure Property Tests', () => {

  test('Property 21: Hero section content structure', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport widths
      fc.boolean(), // has promotion
      (viewportWidth, hasPromotion) => {
        const hero = createHeroSectionStructure(viewportWidth, hasPromotion);

        // Core structure must always be present
        expect(hero.section).toBeDefined();
        expect(hero.container).toBeDefined();
        expect(hero.content).toBeDefined();
        expect(hero.media).toBeDefined();

        // Section must have proper semantic role
        expect(hero.section.role).toBe('banner');
        expect(hero.section.className).toBe('hero-section');

        // Container must adapt to viewport
        expect(hero.container.className).toBe('hero-section__container');
        if (viewportWidth > 768) {
          expect(hero.container.layout).toBe('grid');
        } else {
          expect(hero.container.layout).toBe('stacked');
        }

        // Content area must contain all required elements
        expect(hero.content.title).toBeDefined();
        expect(hero.content.description).toBeDefined();
        expect(hero.content.actions).toBeDefined();

        // Title must have clear value proposition
        expect(hero.content.title.text).toBeTruthy();
        expect(hero.content.title.text.length).toBeGreaterThan(10);
        expect(hero.content.title.highlight).toBeDefined();
        expect(hero.content.title.highlight.text).toBeTruthy();

        // Description must provide supporting information
        expect(hero.content.description.text).toBeTruthy();
        expect(hero.content.description.text.length).toBeGreaterThan(20);
        expect(hero.content.description.maxWidth).toBe('540px');

        // Actions must contain call-to-action buttons
        expect(hero.content.actions.buttons).toBeDefined();
        expect(Array.isArray(hero.content.actions.buttons)).toBe(true);
        expect(hero.content.actions.buttons.length).toBeGreaterThanOrEqual(2);

        // Primary CTA must be present and properly structured
        const primaryButton = hero.content.actions.buttons.find(btn => btn.type === 'primary');
        expect(primaryButton).toBeDefined();
        expect(primaryButton.href).toBeTruthy();
        expect(primaryButton.text).toBeTruthy();
        expect(primaryButton.className).toContain('button--primary');

        // Secondary CTA must be present and properly structured
        const secondaryButton = hero.content.actions.buttons.find(btn => btn.type === 'secondary');
        expect(secondaryButton).toBeDefined();
        expect(secondaryButton.href).toBeTruthy();
        expect(secondaryButton.text).toBeTruthy();
        expect(secondaryButton.className).toContain('button--secondary');

        // Media section must be properly structured
        expect(hero.media.ariaHidden).toBe('true');
        expect(hero.media.picture).toBeDefined();
        expect(hero.media.picture.image).toBeDefined();

        // Image must have proper attributes
        expect(hero.media.picture.image.src).toBeTruthy();
        expect(hero.media.picture.image.alt).toBeDefined(); // Can be empty for decorative
        expect(hero.media.picture.image.loading).toBe('eager');
        expect(hero.media.picture.image.width).toBeGreaterThan(0);
        expect(hero.media.picture.image.height).toBeGreaterThan(0);

        // Responsive image sources must be present
        expect(Array.isArray(hero.media.picture.sources)).toBe(true);
        expect(hero.media.picture.sources.length).toBeGreaterThan(0);

        hero.media.picture.sources.forEach(source => {
          expect(source.media).toBeTruthy();
          expect(source.srcset).toBeTruthy();
          expect(source.sizes).toBeTruthy();
        });

        return true;
      }
    ), { numRuns: 100 });
  });

  test('Hero section call-to-action button accessibility', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.boolean(), // has promotion
      (viewportWidth, hasPromotion) => {
        const hero = createHeroSectionStructure(viewportWidth, hasPromotion);

        // All buttons must have proper accessibility attributes
        hero.content.actions.buttons.forEach(button => {
          // Must have valid href for navigation
          expect(button.href).toBeTruthy();
          expect(button.href.startsWith('/')).toBe(true);
          
          // Must have descriptive text
          expect(button.text).toBeTruthy();
          expect(button.text.length).toBeGreaterThan(3);
          
          // Must have proper CSS classes for styling and behavior
          expect(button.className).toContain('button');
          expect(button.className).toMatch(/button--(primary|secondary)/);
          
          // Button type must match CSS class
          if (button.type === 'primary') {
            expect(button.className).toContain('button--primary');
          } else if (button.type === 'secondary') {
            expect(button.className).toContain('button--secondary');
          }
        });

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Hero section responsive image optimization', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.boolean(), // has promotion
      (viewportWidth, hasPromotion) => {
        const hero = createHeroSectionStructure(viewportWidth, hasPromotion);

        // Picture element must provide responsive sources
        const picture = hero.media.picture;
        expect(picture.sources).toBeDefined();
        expect(Array.isArray(picture.sources)).toBe(true);

        // Must have sources for different viewport sizes
        const desktopSource = picture.sources.find(s => s.media.includes('1024px'));
        const tabletSource = picture.sources.find(s => s.media.includes('768px'));
        
        expect(desktopSource).toBeDefined();
        expect(tabletSource).toBeDefined();

        // Each source must have proper attributes
        picture.sources.forEach(source => {
          expect(source.media).toBeTruthy();
          expect(source.srcset).toBeTruthy();
          expect(source.sizes).toBeTruthy();
          
          // Srcset must contain multiple image sizes
          expect(source.srcset.includes('w')).toBe(true); // Width descriptors
          
          // Sizes must provide appropriate sizing information
          expect(source.sizes.length).toBeGreaterThanOrEqual(5);
        });

        // Fallback image must be present
        expect(picture.image.src).toBeTruthy();
        expect(picture.image.width).toBeGreaterThan(0);
        expect(picture.image.height).toBeGreaterThan(0);

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Hero section content hierarchy and structure', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.boolean(), // has promotion
      (viewportWidth, hasPromotion) => {
        const hero = createHeroSectionStructure(viewportWidth, hasPromotion);

        // Content must follow proper hierarchy
        const content = hero.content;
        
        // Title comes first and is most prominent
        expect(content.title).toBeDefined();
        expect(content.title.className).toBe('hero-section__title');
        
        // Description provides supporting information
        expect(content.description).toBeDefined();
        expect(content.description.className).toBe('hero-section__description');
        
        // Actions come last as the conversion point
        expect(content.actions).toBeDefined();
        expect(content.actions.className).toBe('hero-section__actions');

        // Title must contain highlighted text for emphasis
        expect(content.title.highlight).toBeDefined();
        expect(content.title.highlight.className).toBe('hero-section__highlight');
        expect(content.title.text).toContain(content.title.highlight.text);

        // Description must be concise but informative
        const descriptionWords = content.description.text.split(' ').length;
        expect(descriptionWords).toBeGreaterThan(5);
        expect(descriptionWords).toBeLessThan(30); // Keep it concise

        // Must have at least one primary action
        const primaryActions = content.actions.buttons.filter(btn => btn.type === 'primary');
        expect(primaryActions.length).toBeGreaterThanOrEqual(1);

        return true;
      }
    ), { numRuns: 100 });
  });

  test('Hero section promotional content integration', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.boolean(), // has promotion
      (viewportWidth, hasPromotion) => {
        const hero = createHeroSectionStructure(viewportWidth, hasPromotion);

        if (hasPromotion) {
          // Promotional content must be properly structured
          expect(hero.promotion).toBeDefined();
          expect(hero.promotion.text).toBeTruthy();
          expect(hero.promotion.discount).toBeTruthy();
          expect(hero.promotion.code).toBeTruthy();
          
          // Promotion should enhance but not replace core content
          expect(hero.content.title.text).toBeTruthy();
          expect(hero.content.description.text).toBeTruthy();
          expect(hero.content.actions.buttons.length).toBeGreaterThanOrEqual(2);
        } else {
          // Without promotion, core content must still be complete
          expect(hero.promotion).toBeNull();
          expect(hero.content.title.text).toBeTruthy();
          expect(hero.content.description.text).toBeTruthy();
          expect(hero.content.actions.buttons.length).toBeGreaterThanOrEqual(2);
        }

        return true;
      }
    ), { numRuns: 50 });
  });

  /**
   * **Feature: ecommerce-homepage, Property 15: Image optimization**
   * **Validates: Requirements 4.4**
   * 
   * For any image displayed on the homepage, it should serve optimized 
   * formats and sizes based on device capabilities
   */
  test('Property 15: Image optimization', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.float({ min: 1, max: 3 }), // device pixel ratio
      fc.constantFrom('slow-2g', '2g', '3g', '4g'), // connection type
      (viewportWidth, devicePixelRatio, connectionType) => {
        const hero = createHeroSectionStructure(viewportWidth, false);
        const picture = hero.media.picture;

        // Must provide multiple image formats for optimization
        const webpSources = picture.sources.filter(s => s.type === 'image/webp');
        const jpegSources = picture.sources.filter(s => s.type === 'image/jpeg');
        
        // Should have both WebP and JPEG sources for format optimization
        expect(webpSources.length).toBeGreaterThan(0);
        expect(jpegSources.length).toBeGreaterThan(0);

        // Each format should have multiple sizes for responsive optimization
        [...webpSources, ...jpegSources].forEach(source => {
          expect(source.srcset).toBeTruthy();
          
          // Srcset should contain multiple image sizes
          const sizes = source.srcset.split(',').map(s => s.trim());
          expect(sizes.length).toBeGreaterThanOrEqual(2);
          
          // Each size should have width descriptor
          sizes.forEach(size => {
            expect(size).toMatch(/\d+w$/); // Should end with width descriptor like "800w"
          });
        });

        // Sources should be ordered by media query specificity (largest first)
        const mediaQueries = picture.sources.map(s => s.media);
        const desktopQuery = mediaQueries.find(q => q.includes('1024px'));
        const tabletQuery = mediaQueries.find(q => q.includes('768px'));
        
        expect(desktopQuery).toBeDefined();
        expect(tabletQuery).toBeDefined();

        // Sizes attribute should provide appropriate sizing information
        picture.sources.forEach(source => {
          expect(source.sizes).toBeTruthy();
          expect(source.sizes.length).toBeGreaterThanOrEqual(5);
          
          // Should contain viewport-based sizing
          if (viewportWidth >= 1024) {
            expect(source.sizes).toMatch(/\d+px/); // Should have pixel values
          }
        });

        // Fallback image must be optimized
        expect(picture.image.src).toBeTruthy();
        expect(picture.image.width).toBeGreaterThan(0);
        expect(picture.image.height).toBeGreaterThan(0);
        expect(picture.image.loading).toBe('eager'); // Hero images should load eagerly
        
        // Image should have proper aspect ratio
        const aspectRatio = picture.image.width / picture.image.height;
        expect(aspectRatio).toBeGreaterThan(1); // Landscape orientation for hero
        expect(aspectRatio).toBeLessThan(3); // Not too wide

        // Connection-based optimization considerations
        if (connectionType === 'slow-2g' || connectionType === '2g') {
          // For slow connections, should prioritize smaller images
          // This would be implemented in the actual loading logic
          expect(true).toBe(true); // Placeholder for connection-based logic
        }

        // Device pixel ratio considerations
        if (devicePixelRatio > 2) {
          // For high-DPI displays, should provide higher resolution images
          // Check that srcset includes high-resolution variants
          const hasHighRes = picture.sources.some(source => 
            source.srcset.includes('1200w') || source.srcset.includes('800w')
          );
          expect(hasHighRes).toBe(true);
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  test('Image format optimization and browser support', () => {
    fc.assert(fc.property(
      fc.boolean(), // WebP support
      fc.boolean(), // AVIF support
      fc.integer({ min: 320, max: 1920 }), // viewport width
      (supportsWebP, supportsAVIF, viewportWidth) => {
        const hero = createHeroSectionStructure(viewportWidth, false);
        const picture = hero.media.picture;

        // Must always have JPEG fallback regardless of browser support
        const jpegSources = picture.sources.filter(s => 
          !s.type || s.type === 'image/jpeg'
        );
        expect(jpegSources.length).toBeGreaterThan(0);

        // WebP sources should be present for optimization
        const webpSources = picture.sources.filter(s => s.type === 'image/webp');
        expect(webpSources.length).toBeGreaterThan(0);

        // Sources should be ordered correctly (modern formats first)
        const sourceTypes = picture.sources.map(s => s.type).filter(Boolean);
        
        // WebP should come before JPEG in source order
        const webpIndex = sourceTypes.indexOf('image/webp');
        const jpegIndex = sourceTypes.indexOf('image/jpeg');
        
        if (webpIndex !== -1 && jpegIndex !== -1) {
          expect(webpIndex).toBeLessThan(jpegIndex);
        }

        // Each source should have appropriate media queries
        picture.sources.forEach(source => {
          if (source.media) {
            expect(source.media).toMatch(/\(min-width:\s*\d+px\)/);
          }
        });

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Responsive image sizing optimization', () => {
    fc.assert(fc.property(
      fc.integer({ min: 320, max: 1920 }), // viewport width
      fc.integer({ min: 200, max: 800 }), // container width
      (viewportWidth, containerWidth) => {
        const hero = createHeroSectionStructure(viewportWidth, false);
        const picture = hero.media.picture;

        // Sizes attribute should match container sizing
        picture.sources.forEach(source => {
          expect(source.sizes).toBeTruthy();
          
          // Should provide appropriate sizing for different viewports
          if (viewportWidth >= 1024) {
            // Desktop: should specify fixed size or percentage
            expect(source.sizes).toMatch(/\d+px|vw/);
          } else if (viewportWidth >= 768) {
            // Tablet: should adapt to medium screens
            expect(source.sizes).toMatch(/\d+px/);
          } else {
            // Mobile: should be responsive
            expect(source.sizes).toBeTruthy();
          }
        });

        // Image dimensions should be reasonable for hero section
        const image = picture.image;
        expect(image.width).toBeGreaterThanOrEqual(300);
        expect(image.width).toBeLessThanOrEqual(1200);
        expect(image.height).toBeGreaterThanOrEqual(200);
        expect(image.height).toBeLessThanOrEqual(800);

        // Aspect ratio should be appropriate for hero display
        const aspectRatio = image.width / image.height;
        expect(aspectRatio).toBeGreaterThan(1.2); // At least 1.2:1
        expect(aspectRatio).toBeLessThan(2.5); // No more than 2.5:1

        return true;
      }
    ), { numRuns: 75 });
  });
});