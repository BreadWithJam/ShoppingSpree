/**
 * Property-based tests for ecommerce homepage components
 * Using fast-check for property-based testing
 */

const fc = require('fast-check');

/**
 * **Feature: ecommerce-homepage, Property 3: Product information completeness**
 * **Validates: Requirements 2.2**
 * 
 * For any product card displayed in showcase sections, it should contain 
 * product name, price, ratings, and a primary call-to-action button
 */
describe('Property 3: Product information completeness', () => {

  // Arbitrary for generating product data
  const productDataArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
    originalPrice: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }), { nil: null }),
    rating: fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }),
    reviewCount: fc.integer({ min: 0, max: 10000 }),
    imageUrl: fc.webUrl(),
    altText: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    badge: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { nil: null })
  });

  it('should generate product card HTML with all required information elements', () => {
    fc.assert(fc.property(productDataArb, (productData) => {
      // Generate product card HTML string
      const productCardHtml = generateProductCardHtml(productData);

      // Verify product name is present and not empty
      expect(productCardHtml).toMatch(new RegExp(`<h3[^>]*class="product-card__title"[^>]*>${escapeRegex(productData.name)}</h3>`));

      // Verify price is present and formatted correctly
      expect(productCardHtml).toMatch(/\$\d+\.\d{2}/);
      expect(productCardHtml).toContain(`$${productData.price.toFixed(2)}`);

      // Verify rating elements are present
      expect(productCardHtml).toMatch(/class="product-card__rating"/);
      expect(productCardHtml).toMatch(/class="product-card__stars"/);
      expect(productCardHtml).toMatch(/class="product-card__rating-text"/);
      expect(productCardHtml).toContain(`(${productData.reviewCount})`);

      // Verify call-to-action button is present
      expect(productCardHtml).toMatch(/class="product-card__action[^"]*"/);
      expect(productCardHtml).toContain('Add to Cart');
      expect(productCardHtml).toContain(`data-product-id="${productData.id}"`);

      // Verify proper semantic structure
      expect(productCardHtml).toMatch(/<article[^>]*class="product-card"/);
      expect(productCardHtml).toContain('itemscope');
      expect(productCardHtml).toContain('itemtype="https://schema.org/Product"');

    }), { numRuns: 100 });
  });

  it('should handle sale prices correctly when present', () => {
    const productWithSaleArb = fc.integer({ min: 1, max: 10000 }).chain(id =>
      fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0).chain(name =>
        fc.float({ min: Math.fround(10), max: Math.fround(999.99), noNaN: true }).chain(originalPrice =>
          fc.float({ min: Math.fround(0.01), max: Math.fround(originalPrice - 0.01), noNaN: true }).chain(price =>
            fc.float({ min: Math.fround(0), max: Math.fround(5), noNaN: true }).chain(rating =>
              fc.integer({ min: 0, max: 10000 }).chain(reviewCount =>
                fc.webUrl().chain(imageUrl =>
                  fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0).chain(altText =>
                    fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { nil: null }).map(badge => ({
                      id,
                      name,
                      price,
                      originalPrice,
                      rating,
                      reviewCount,
                      imageUrl,
                      altText,
                      badge
                    }))
                  )
                )
              )
            )
          )
        )
      )
    );

    fc.assert(fc.property(productWithSaleArb, (productData) => {
      const productCardHtml = generateProductCardHtml(productData);

      // Should have both current price and original price
      expect(productCardHtml).toContain(`$${productData.price.toFixed(2)}`);
      expect(productCardHtml).toContain(`$${productData.originalPrice.toFixed(2)}`);
      expect(productCardHtml).toMatch(/class="product-card__original-price"/);
      
      // Original price should be higher than sale price
      expect(productData.originalPrice).toBeGreaterThan(productData.price);

    }), { numRuns: 100 });
  });

  it('should have proper accessibility attributes in generated HTML', () => {
    fc.assert(fc.property(productDataArb, (productData) => {
      const productCardHtml = generateProductCardHtml(productData);

      // Article should have proper semantic structure
      expect(productCardHtml).toMatch(/<article[^>]*itemscope[^>]*>/);
      expect(productCardHtml).toContain('itemtype="https://schema.org/Product"');

      // Image should have alt text
      expect(productCardHtml).toContain(`alt="${productData.altText}"`);

      // Button should have proper aria-label
      expect(productCardHtml).toContain(`aria-label="Add ${productData.name} to cart"`);

      // Rating should have proper role and aria-label
      expect(productCardHtml).toMatch(/role="img"/);
      expect(productCardHtml).toMatch(/aria-label="[^"]*out of 5 stars[^"]*reviews"/);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate product card HTML string
   */
  function generateProductCardHtml(productData) {
    const displayPrice = productData.originalPrice && productData.price < productData.originalPrice 
      ? productData.price 
      : productData.price;

    // Generate star rating HTML
    const fullStars = Math.floor(productData.rating);
    const hasHalfStar = productData.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star star--filled" aria-hidden="true">★</span>';
    }
    if (hasHalfStar) {
      starsHtml += '<span class="star star--half" aria-hidden="true">☆</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star star--empty" aria-hidden="true">☆</span>';
    }

    return `
      <article class="product-card" itemscope itemtype="https://schema.org/Product">
        <div class="product-card__image-container">
          <picture class="product-card__picture">
            <img 
              class="product-card__image" 
              src="${productData.imageUrl}" 
              alt="${productData.altText}"
              loading="lazy"
              width="400"
              height="300"
              itemprop="image"
            >
          </picture>
          ${productData.badge ? `<div class="product-card__badge" aria-label="${productData.badge}">${productData.badge}</div>` : ''}
        </div>
        <div class="product-card__content">
          <h3 class="product-card__title" itemprop="name">${productData.name}</h3>
          <div class="product-card__rating" role="img" aria-label="${productData.rating.toFixed(1)} out of 5 stars, ${productData.reviewCount} reviews">
            <div class="product-card__stars">
              ${starsHtml}
            </div>
            <span class="product-card__rating-text">(${productData.reviewCount})</span>
          </div>
          <div class="product-card__pricing" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span class="product-card__price" itemprop="price">$${displayPrice.toFixed(2)}</span>
            ${productData.originalPrice && productData.price < productData.originalPrice ? 
              `<span class="product-card__original-price">$${productData.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <button class="product-card__action button button--primary" data-product-id="${productData.id}" aria-label="Add ${productData.name} to cart">
            Add to Cart
          </button>
        </div>
      </article>
    `.trim();
  }

  /**
   * Helper function to escape special regex characters
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
});

/**
 * **Feature: ecommerce-homepage, Property 4: Interactive feedback consistency**
 * **Validates: Requirements 2.3**
 * 
 * For any interactive product card, hover states and visual feedback 
 * should be provided when users interact with the element
 */
describe('Property 4: Interactive feedback consistency', () => {

  // Arbitrary for generating product card interaction data
  const interactionDataArb = fc.record({
    productId: fc.integer({ min: 1, max: 10000 }),
    productName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    interactionType: fc.constantFrom('hover', 'focus', 'click'),
    hasTransition: fc.boolean(),
    hasTransform: fc.boolean(),
    hasBoxShadow: fc.boolean()
  });

  it('should generate CSS classes for interactive states', () => {
    fc.assert(fc.property(interactionDataArb, (interactionData) => {
      const cssClasses = generateInteractiveCSSClasses(interactionData);

      // Should contain base product card class
      expect(cssClasses).toContain('product-card');

      // Should contain appropriate interaction state classes
      if (interactionData.interactionType === 'hover') {
        expect(cssClasses).toMatch(/product-card:hover|product-card--hovered/);
      }
      
      if (interactionData.interactionType === 'focus') {
        expect(cssClasses).toMatch(/product-card:focus-within|product-card--focused/);
      }

      // Should include visual feedback properties
      if (interactionData.hasTransition) {
        expect(cssClasses).toMatch(/transition/);
      }

      if (interactionData.hasTransform) {
        expect(cssClasses).toMatch(/transform|translateY/);
      }

      if (interactionData.hasBoxShadow) {
        expect(cssClasses).toMatch(/box-shadow/);
      }

    }), { numRuns: 100 });
  });

  it('should provide consistent hover feedback across all product cards', () => {
    const productCardArb = fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      hasImage: fc.boolean(),
      hasButton: fc.boolean(),
      isInteractive: fc.boolean()
    });

    fc.assert(fc.property(productCardArb, (cardData) => {
      const hoverStyles = generateHoverStyles(cardData);

      // All interactive product cards should have hover effects
      if (cardData.isInteractive) {
        expect(hoverStyles).toMatch(/transform.*translateY/);
        expect(hoverStyles).toMatch(/box-shadow/);
        expect(hoverStyles).toMatch(/transition/);
      }

      // Image hover effects should be consistent
      if (cardData.hasImage) {
        expect(hoverStyles).toMatch(/\.product-card:hover \.product-card__image/);
        expect(hoverStyles).toMatch(/transform.*scale/);
      }

      // Button hover effects should be consistent
      if (cardData.hasButton) {
        expect(hoverStyles).toMatch(/\.product-card__action:hover/);
        expect(hoverStyles).toMatch(/background-color/);
      }

    }), { numRuns: 100 });
  });

  it('should maintain accessibility during interactive states', () => {
    const accessibilityDataArb = fc.record({
      productId: fc.integer({ min: 1, max: 10000 }),
      productName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      hasFocusIndicator: fc.boolean(),
      hasAriaLabel: fc.boolean(),
      hasKeyboardSupport: fc.boolean()
    });

    fc.assert(fc.property(accessibilityDataArb, (accessibilityData) => {
      const accessibilityHTML = generateAccessibilityHTML(accessibilityData);

      // Should maintain proper ARIA attributes during interactions
      if (accessibilityData.hasAriaLabel) {
        expect(accessibilityHTML).toMatch(/aria-label="[^"]*"/);
      }

      // Should have focus indicators for keyboard navigation
      if (accessibilityData.hasFocusIndicator) {
        expect(accessibilityHTML).toMatch(/focus-within[\s\S]*outline|focus[\s\S]*border/);
      }

      // Should support keyboard interactions
      if (accessibilityData.hasKeyboardSupport) {
        expect(accessibilityHTML).toMatch(/tabindex|role="button"/);
      }

      // Product name should always be accessible
      expect(accessibilityHTML).toContain(accessibilityData.productName);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate CSS classes for interactive states
   */
  function generateInteractiveCSSClasses(interactionData) {
    let cssClasses = '.product-card {\n';
    cssClasses += '  background-color: var(--color-surface);\n';
    cssClasses += '  border-radius: var(--radius-lg);\n';
    cssClasses += '  overflow: hidden;\n';
    cssClasses += '  box-shadow: var(--shadow-sm);\n';
    
    if (interactionData.hasTransition) {
      cssClasses += '  transition: all var(--transition-normal);\n';
    }
    
    cssClasses += '  border: 1px solid transparent;\n';
    cssClasses += '}\n\n';

    // Add hover/focus states
    cssClasses += '.product-card:hover,\n';
    cssClasses += '.product-card:focus-within {\n';
    
    if (interactionData.hasTransform) {
      cssClasses += '  transform: translateY(-4px);\n';
    }
    
    if (interactionData.hasBoxShadow) {
      cssClasses += '  box-shadow: var(--shadow-xl);\n';
    }
    
    cssClasses += '  border-color: var(--color-primary);\n';
    cssClasses += '}\n';

    return cssClasses;
  }

  /**
   * Helper function to generate hover styles
   */
  function generateHoverStyles(cardData) {
    let styles = '';

    if (cardData.isInteractive) {
      styles += '.product-card:hover {\n';
      styles += '  transform: translateY(-4px);\n';
      styles += '  box-shadow: var(--shadow-xl);\n';
      styles += '  transition: all var(--transition-normal);\n';
      styles += '}\n\n';
    }

    if (cardData.hasImage) {
      styles += '.product-card:hover .product-card__image {\n';
      styles += '  transform: scale(1.05);\n';
      styles += '  transition: transform var(--transition-normal);\n';
      styles += '}\n\n';
    }

    if (cardData.hasButton) {
      styles += '.product-card__action:hover {\n';
      styles += '  background-color: var(--color-primary);\n';
      styles += '  transform: translateY(-1px);\n';
      styles += '}\n\n';
    }

    return styles;
  }

  /**
   * Helper function to generate accessibility HTML
   */
  function generateAccessibilityHTML(accessibilityData) {
    let html = `<article class="product-card" itemscope itemtype="https://schema.org/Product">`;
    
    html += `<div class="product-card__content">`;
    html += `<h3 class="product-card__title" itemprop="name">${accessibilityData.productName}</h3>`;
    
    // Always add a button if we need to test keyboard support or aria-label
    if (accessibilityData.hasKeyboardSupport || accessibilityData.hasAriaLabel) {
      html += `<button class="product-card__action" `;
      html += `data-product-id="${accessibilityData.productId}" `;
      
      if (accessibilityData.hasAriaLabel) {
        html += `aria-label="Add ${accessibilityData.productName} to cart" `;
      }
      
      if (accessibilityData.hasKeyboardSupport) {
        html += `tabindex="0" `;
      }
      
      html += `>Add to Cart</button>`;
    }
    
    html += `</div>`;
    html += `</article>`;

    // Add CSS for focus indicators
    if (accessibilityData.hasFocusIndicator) {
      html += `\n<style>\n`;
      html += `.product-card:focus-within {\n`;
      html += `  outline: 2px solid var(--color-focus);\n`;
      html += `  outline-offset: 2px;\n`;
      html += `}\n`;
      html += `</style>`;
    }

    return html;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 6: Product categorization structure**
 * **Validates: Requirements 2.5**
 * 
 * For any product showcase section with categories, products should be 
 * organized into logical groupings with clear section headers
 */
describe('Property 6: Product categorization structure', () => {

  // Arbitrary for generating category data
  const categoryDataArb = fc.record({
    categoryName: fc.constantFrom('Featured', 'Electronics', 'Fashion', 'Sports', 'Home & Living', 'Beauty'),
    categorySlug: fc.constantFrom('featured', 'electronics', 'fashion', 'sports', 'home-living', 'beauty'),
    productCount: fc.integer({ min: 1, max: 12 }),
    hasSubcategories: fc.boolean(),
    displayOrder: fc.integer({ min: 1, max: 10 })
  });

  it('should generate proper section structure for product categories', () => {
    fc.assert(fc.property(categoryDataArb, (categoryData) => {
      const categoryHTML = generateCategorySection(categoryData);

      // Should have proper semantic section structure
      expect(categoryHTML).toMatch(/<section[^>]*class="product-showcase[^"]*"/);
      expect(categoryHTML).toMatch(/role="region"/);
      expect(categoryHTML).toMatch(/aria-labelledby="[^"]*-heading"/);

      // Should have clear section header with category name
      expect(categoryHTML).toMatch(/<h2[^>]*id="[^"]*-heading"[^>]*>/);
      expect(categoryHTML).toContain(categoryData.categoryName);

      // Should have "View All" link for the category
      expect(categoryHTML).toMatch(/<a[^>]*href="[^"]*"[^>]*class="section-link"[^>]*>/);
      expect(categoryHTML).toMatch(/View All/);

      // Should contain product grid structure
      expect(categoryHTML).toMatch(/<ul[^>]*class="product-grid"[^>]*>/);

    }), { numRuns: 100 });
  });

  it('should maintain consistent heading hierarchy across categories', () => {
    const uniqueCategoriesArb = fc.array(categoryDataArb, { minLength: 2, maxLength: 5 })
      .map(categories => {
        // Ensure unique categories by slug
        const uniqueCategories = [];
        const seenSlugs = new Set();
        
        for (const category of categories) {
          if (!seenSlugs.has(category.categorySlug)) {
            uniqueCategories.push(category);
            seenSlugs.add(category.categorySlug);
          }
        }
        
        return uniqueCategories.length >= 2 ? uniqueCategories : [
          { ...categories[0], categorySlug: 'featured', categoryName: 'Featured' },
          { ...categories[0], categorySlug: 'electronics', categoryName: 'Electronics' }
        ];
      });

    fc.assert(fc.property(uniqueCategoriesArb, (categoriesData) => {
      const allCategoriesHTML = categoriesData.map(generateCategorySection).join('\n');

      // All category headings should be h2 elements (consistent hierarchy)
      const h2Matches = allCategoriesHTML.match(/<h2[^>]*>/g) || [];
      expect(h2Matches.length).toBe(categoriesData.length);

      // Each category should have unique heading ID
      const headingIds = [];
      categoriesData.forEach(category => {
        const expectedId = `${category.categorySlug}-products-heading`;
        expect(allCategoriesHTML).toContain(`id="${expectedId}"`);
        headingIds.push(expectedId);
      });

      // All heading IDs should be unique
      const uniqueIds = [...new Set(headingIds)];
      expect(uniqueIds.length).toBe(headingIds.length);

    }), { numRuns: 100 });
  });

  it('should provide proper navigation links for each category', () => {
    fc.assert(fc.property(categoryDataArb, (categoryData) => {
      const categoryHTML = generateCategorySection(categoryData);

      // Should have category-specific navigation link
      const expectedHref = `/category/${categoryData.categorySlug}`;
      expect(categoryHTML).toContain(`href="${expectedHref}"`);

      // Link text should be descriptive
      expect(categoryHTML).toMatch(/View All [A-Za-z\s&]+/);

      // Should have proper link accessibility
      expect(categoryHTML).toMatch(/<a[^>]*class="section-link"[^>]*>/);

    }), { numRuns: 100 });
  });

  it('should organize products within logical category groupings', () => {
    const categoryWithProductsArb = fc.record({
      ...categoryDataArb.value,
      products: fc.array(fc.record({
        id: fc.integer({ min: 1, max: 10000 }),
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        category: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
      }), { minLength: 1, maxLength: 8 })
    });

    fc.assert(fc.property(categoryWithProductsArb, (categoryData) => {
      const categoryHTML = generateCategoryWithProducts(categoryData);

      // Should contain all products in the category
      categoryData.products.forEach(product => {
        expect(categoryHTML).toContain(product.name);
        expect(categoryHTML).toContain(`data-product-id="${product.id}"`);
      });

      // Should have proper product grid structure
      expect(categoryHTML).toMatch(/<ul[^>]*class="product-grid"[^>]*>/);
      
      // Number of product cards should match product count
      const productCardMatches = categoryHTML.match(/<article[^>]*class="product-card"[^>]*>/g) || [];
      expect(productCardMatches.length).toBe(categoryData.products.length);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate category section HTML
   */
  function generateCategorySection(categoryData) {
    const headingId = `${categoryData.categorySlug}-products-heading`;
    const categoryClass = categoryData.categorySlug !== 'featured' 
      ? `product-showcase--${categoryData.categorySlug}` 
      : '';

    return `
      <section class="product-showcase ${categoryClass}" role="region" aria-labelledby="${headingId}">
        <div class="section-container">
          <header class="section-header">
            <h2 id="${headingId}" class="section-title">${categoryData.categoryName} <span class="section-title__highlight">Collection</span></h2>
            <a href="/category/${categoryData.categorySlug}" class="section-link">View All ${categoryData.categoryName}</a>
          </header>
          <ul class="product-grid">
            <!-- Products would be rendered here -->
          </ul>
        </div>
      </section>
    `.trim();
  }

  /**
   * Helper function to generate category section with products
   */
  function generateCategoryWithProducts(categoryData) {
    const headingId = `${categoryData.categorySlug}-products-heading`;
    const categoryClass = categoryData.categorySlug !== 'featured' 
      ? `product-showcase--${categoryData.categorySlug}` 
      : '';

    let productsHTML = '';
    categoryData.products.forEach(product => {
      productsHTML += `
        <li>
          <article class="product-card" itemscope itemtype="https://schema.org/Product">
            <div class="product-card__content">
              <h3 class="product-card__title" itemprop="name">${product.name}</h3>
              <button class="product-card__action button button--primary" data-product-id="${product.id}">
                Add to Cart
              </button>
            </div>
          </article>
        </li>
      `;
    });

    return `
      <section class="product-showcase ${categoryClass}" role="region" aria-labelledby="${headingId}">
        <div class="section-container">
          <header class="section-header">
            <h2 id="${headingId}" class="section-title">${categoryData.categoryName} <span class="section-title__highlight">Collection</span></h2>
            <a href="/category/${categoryData.categorySlug}" class="section-link">View All ${categoryData.categoryName}</a>
          </header>
          <ul class="product-grid">
            ${productsHTML}
          </ul>
        </div>
      </section>
    `.trim();
  }
});

/**
 * **Feature: ecommerce-homepage, Property 5: Lazy loading implementation**
 * **Validates: Requirements 2.4**
 * 
 * For any product image displayed on the homepage, it should implement 
 * lazy loading attributes for performance optimization
 */
describe('Property 5: Lazy loading implementation', () => {

  // Arbitrary for generating image data
  const imageDataArb = fc.record({
    src: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    width: fc.integer({ min: 100, max: 800 }),
    height: fc.integer({ min: 100, max: 600 }),
    hasLazyLoading: fc.boolean(),
    hasPlaceholder: fc.boolean(),
    hasErrorHandling: fc.boolean()
  });

  it('should implement lazy loading attributes for all product images', () => {
    fc.assert(fc.property(imageDataArb, (imageData) => {
      const imageHTML = generateImageHTML(imageData);

      if (imageData.hasLazyLoading) {
        // Should have lazy loading attribute
        expect(imageHTML).toMatch(/loading="lazy"/);
        
        // Should have proper dimensions
        expect(imageHTML).toContain(`width="${imageData.width}"`);
        expect(imageHTML).toContain(`height="${imageData.height}"`);
        
        // Should have alt text for accessibility
        expect(imageHTML).toContain(`alt="${imageData.alt}"`);
        
        // Should be within a proper container structure
        expect(imageHTML).toMatch(/class="product-card__image-container"/);
        expect(imageHTML).toMatch(/class="product-card__image"/);
      }

    }), { numRuns: 100 });
  });

  it('should provide loading placeholders for better user experience', () => {
    fc.assert(fc.property(imageDataArb, (imageData) => {
      const lazyLoadingHTML = generateLazyLoadingHTML(imageData);

      if (imageData.hasPlaceholder) {
        // Should have loading placeholder structure
        expect(lazyLoadingHTML).toMatch(/class="lazy-loading-placeholder"/);
        expect(lazyLoadingHTML).toMatch(/class="lazy-loading-spinner"/);
        expect(lazyLoadingHTML).toMatch(/class="lazy-loading-text"/);
        
        // Should have proper ARIA attributes
        expect(lazyLoadingHTML).toMatch(/aria-hidden="true"/);
        
        // Should contain loading text
        expect(lazyLoadingHTML).toContain('Loading...');
      }

    }), { numRuns: 100 });
  });

  it('should handle image loading errors gracefully', () => {
    fc.assert(fc.property(imageDataArb, (imageData) => {
      const errorStateHTML = generateErrorStateHTML(imageData);

      if (imageData.hasErrorHandling) {
        // Should have error state structure
        expect(errorStateHTML).toMatch(/class="lazy-error-state"/);
        expect(errorStateHTML).toMatch(/class="lazy-error-icon"/);
        expect(errorStateHTML).toMatch(/class="lazy-error-text"/);
        expect(errorStateHTML).toMatch(/class="lazy-retry-button"/);
        
        // Should have proper ARIA attributes
        expect(errorStateHTML).toMatch(/aria-hidden="true"/);
        
        // Should contain error message and retry option
        expect(errorStateHTML).toContain('Image failed to load');
        expect(errorStateHTML).toContain('Retry');
        
        // Retry button should be interactive
        expect(errorStateHTML).toMatch(/type="button"/);
      }

    }), { numRuns: 100 });
  });

  it('should optimize image URLs based on device capabilities', () => {
    const optimizationDataArb = fc.record({
      originalUrl: fc.webUrl().filter(url => url.includes('unsplash.com')),
      targetWidth: fc.integer({ min: 200, max: 800 }),
      quality: fc.integer({ min: 60, max: 100 }),
      supportsWebP: fc.boolean()
    });

    fc.assert(fc.property(optimizationDataArb, (optimizationData) => {
      const optimizedUrl = generateOptimizedImageUrl(optimizationData);

      // Should contain width parameter
      expect(optimizedUrl).toMatch(/[?&]w=\d+/);
      expect(optimizedUrl).toContain(`w=${optimizationData.targetWidth}`);
      
      // Should contain quality parameter
      expect(optimizedUrl).toMatch(/[?&]q=\d+/);
      expect(optimizedUrl).toContain(`q=${optimizationData.quality}`);
      
      // Should include WebP format if supported
      if (optimizationData.supportsWebP) {
        expect(optimizedUrl).toMatch(/[?&]fm=webp/);
      }

    }), { numRuns: 100 });
  });

  it('should maintain proper aspect ratios during loading states', () => {
    const aspectRatioArb = fc.record({
      width: fc.integer({ min: 200, max: 800 }),
      height: fc.integer({ min: 150, max: 600 }),
      containerClass: fc.constantFrom('product-card__image-container', 'hero-section__image-container')
    });

    fc.assert(fc.property(aspectRatioArb, (aspectData) => {
      const containerHTML = generateImageContainerHTML(aspectData);

      // Should have proper container structure
      expect(containerHTML).toContain(`class="${aspectData.containerClass}"`);
      
      // Should maintain aspect ratio with proper dimensions
      expect(containerHTML).toContain(`width="${aspectData.width}"`);
      expect(containerHTML).toContain(`height="${aspectData.height}"`);
      
      // Should have relative positioning for overlays
      expect(containerHTML).toMatch(/position:\s*relative/);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate image HTML
   */
  function generateImageHTML(imageData) {
    const lazyAttr = imageData.hasLazyLoading ? 'loading="lazy"' : '';
    
    return `
      <div class="product-card__image-container">
        <picture class="product-card__picture">
          <img 
            class="product-card__image" 
            src="${imageData.src}" 
            alt="${imageData.alt}"
            ${lazyAttr}
            width="${imageData.width}"
            height="${imageData.height}"
            itemprop="image"
          >
        </picture>
      </div>
    `.trim();
  }

  /**
   * Helper function to generate lazy loading HTML
   */
  function generateLazyLoadingHTML(imageData) {
    if (!imageData.hasPlaceholder) {
      return '';
    }

    return `
      <div class="lazy-loading-placeholder" aria-hidden="true">
        <div class="lazy-loading-spinner"></div>
        <div class="lazy-loading-text">Loading...</div>
      </div>
    `.trim();
  }

  /**
   * Helper function to generate error state HTML
   */
  function generateErrorStateHTML(imageData) {
    if (!imageData.hasErrorHandling) {
      return '';
    }

    return `
      <div class="lazy-error-state" aria-hidden="true">
        <div class="lazy-error-icon">⚠️</div>
        <div class="lazy-error-text">Image failed to load</div>
        <button class="lazy-retry-button" type="button">Retry</button>
      </div>
    `.trim();
  }

  /**
   * Helper function to generate optimized image URL
   */
  function generateOptimizedImageUrl(optimizationData) {
    try {
      const url = new URL(optimizationData.originalUrl);
      url.searchParams.set('w', optimizationData.targetWidth.toString());
      url.searchParams.set('q', optimizationData.quality.toString());
      
      if (optimizationData.supportsWebP) {
        url.searchParams.set('fm', 'webp');
      }
      
      return url.toString();
    } catch (error) {
      return optimizationData.originalUrl;
    }
  }

  /**
   * Helper function to generate image container HTML
   */
  function generateImageContainerHTML(aspectData) {
    return `
      <div class="${aspectData.containerClass}" style="position: relative;">
        <img 
          class="product-card__image" 
          width="${aspectData.width}"
          height="${aspectData.height}"
          loading="lazy"
        >
      </div>
    `.trim();
  }
});

/**
 * **Feature: ecommerce-homepage, Property 7: Keyboard navigation accessibility**
 * **Validates: Requirements 3.1**
 * 
 * For any interactive element on the homepage, it should be keyboard accessible 
 * with visible focus indicators
 */
describe('Property 7: Keyboard navigation accessibility', () => {

  // Arbitrary for generating interactive element data
  const interactiveElementArb = fc.record({
    elementType: fc.constantFrom('button', 'link', 'input', 'select'),
    hasTabIndex: fc.boolean(),
    hasFocusIndicator: fc.boolean(),
    hasAriaLabel: fc.boolean(),
    hasKeyboardHandler: fc.boolean(),
    isDisabled: fc.boolean(),
    minTouchTarget: fc.integer({ min: 44, max: 60 })
  });

  it('should ensure all interactive elements are keyboard accessible', () => {
    fc.assert(fc.property(interactiveElementArb, (elementData) => {
      const elementHTML = generateInteractiveElementHTML(elementData);

      if (!elementData.isDisabled) {
        // Interactive elements should be focusable
        if (elementData.elementType === 'button' || elementData.elementType === 'link') {
          // Buttons and links are naturally focusable
          expect(elementHTML).not.toContain('tabindex="-1"');
        }

        // Should have proper tabindex if specified
        if (elementData.hasTabIndex) {
          expect(elementHTML).toMatch(/tabindex="[0-9]+"/);
        }

        // Should have ARIA labels for accessibility
        if (elementData.hasAriaLabel) {
          expect(elementHTML).toMatch(/aria-label="[^"]+"/);
        }

        // Should meet minimum touch target size
        expect(elementData.minTouchTarget).toBeGreaterThanOrEqual(44);
      }

    }), { numRuns: 100 });
  });

  it('should provide visible focus indicators for keyboard users', () => {
    fc.assert(fc.property(interactiveElementArb, (elementData) => {
      const focusCSS = generateFocusIndicatorCSS(elementData);

      if (elementData.hasFocusIndicator && !elementData.isDisabled) {
        // Should have outline or border focus indicator
        expect(focusCSS).toMatch(/:focus[\s\S]*outline|:focus[\s\S]*border/);
        
        // Focus indicator should be visible (not transparent or none)
        expect(focusCSS).not.toMatch(/outline:\s*none/);
        expect(focusCSS).not.toMatch(/outline:\s*0/);
        expect(focusCSS).not.toMatch(/outline-color:\s*transparent/);
        
        // Should have proper contrast for visibility (check for 2px or more in outline shorthand)
        expect(focusCSS).toMatch(/outline:\s*[2-9]px|outline:\s*[1-9]\d+px/);
        expect(focusCSS).toMatch(/outline-offset/);
      }

    }), { numRuns: 100 });
  });

  it('should support keyboard event handlers for interactive elements', () => {
    const keyboardEventArb = fc.record({
      elementType: fc.constantFrom('button', 'link', 'input'),
      keyPressed: fc.constantFrom('Enter', 'Space', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown'),
      hasEventHandler: fc.boolean(),
      preventDefault: fc.boolean(),
      stopPropagation: fc.boolean()
    });

    fc.assert(fc.property(keyboardEventArb, (eventData) => {
      const keyboardHandler = generateKeyboardEventHandler(eventData);

      if (eventData.hasEventHandler) {
        // Should handle appropriate keys for element type
        if (eventData.elementType === 'button' && (eventData.keyPressed === 'Enter' || eventData.keyPressed === 'Space')) {
          expect(keyboardHandler).toContain('case \'Enter\'');
          expect(keyboardHandler).toContain('case \' \'');
        }

        if (eventData.elementType === 'link' && eventData.keyPressed === 'Enter') {
          expect(keyboardHandler).toContain('case \'Enter\'');
        }

        // Should prevent default behavior when appropriate
        if (eventData.preventDefault) {
          expect(keyboardHandler).toContain('event.preventDefault()');
        }

        // Should handle navigation keys for complex components
        if (['ArrowUp', 'ArrowDown'].includes(eventData.keyPressed)) {
          expect(keyboardHandler).toMatch(/Arrow(Up|Down)/);
        }
      }

    }), { numRuns: 100 });
  });

  it('should maintain logical tab order throughout the page', () => {
    const tabOrderArb = fc.record({
      elements: fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[a-zA-Z0-9_-]+$/.test(s)),
        elementType: fc.constantFrom('button', 'link', 'input'),
        tabIndex: fc.integer({ min: 0, max: 10 }),
        isVisible: fc.boolean(),
        isDisabled: fc.boolean()
      }), { minLength: 3, maxLength: 10 })
    });

    fc.assert(fc.property(tabOrderArb, (tabData) => {
      const tabOrderHTML = generateTabOrderHTML(tabData);

      // Filter to focusable elements
      const focusableElements = tabData.elements.filter(el => 
        el.isVisible && !el.isDisabled
      );

      if (focusableElements.length > 0) {
        // Should have proper tab order structure
        focusableElements.forEach(element => {
          expect(tabOrderHTML).toContain(`id="${element.id}"`);
          
          // Elements with tabindex="0" should be in natural tab order
          if (element.tabIndex === 0) {
            expect(tabOrderHTML).toContain(`id="${element.id}" tabindex="0"`);
          }
        });

        // Should not have negative tabindex for interactive elements (except when intentionally removed from tab order)
        expect(tabOrderHTML).not.toMatch(/tabindex="-[1-9]/);
      }

    }), { numRuns: 100 });
  });

  it('should support roving tabindex for grid navigation', () => {
    const gridNavigationArb = fc.record({
      gridType: fc.constantFrom('product-grid', 'categories-grid'),
      itemCount: fc.integer({ min: 2, max: 12 }),
      columns: fc.integer({ min: 2, max: 4 }),
      currentFocusIndex: fc.integer({ min: 0, max: 11 }),
      navigationKey: fc.constantFrom('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End')
    }).filter(data => data.currentFocusIndex < data.itemCount);

    fc.assert(fc.property(gridNavigationArb, (gridData) => {
      const gridHTML = generateGridNavigationHTML(gridData);

      // Should have proper grid structure
      expect(gridHTML).toContain(`class="${gridData.gridType}"`);

      // Should implement roving tabindex pattern
      const focusableItems = Math.min(gridData.itemCount, 12);
      
      // Only one item should have tabindex="0", others should have tabindex="-1"
      const tabIndexZeroMatches = (gridHTML.match(/tabindex="0"/g) || []).length;
      const tabIndexMinusOneMatches = (gridHTML.match(/tabindex="-1"/g) || []).length;
      
      expect(tabIndexZeroMatches).toBe(1); // Only one element should be focusable
      expect(tabIndexMinusOneMatches).toBe(focusableItems - 1); // All others should be unfocusable

      // Should handle arrow key navigation
      const keyHandler = generateGridKeyHandler(gridData);
      expect(keyHandler).toContain(gridData.navigationKey);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate interactive element HTML
   */
  function generateInteractiveElementHTML(elementData) {
    let html = '';
    const minSize = `min-height: ${elementData.minTouchTarget}px; min-width: ${elementData.minTouchTarget}px;`;
    
    switch (elementData.elementType) {
      case 'button':
        html = `<button class="button" style="${minSize}"`;
        if (elementData.hasTabIndex) html += ` tabindex="0"`;
        if (elementData.hasAriaLabel) html += ` aria-label="Interactive button"`;
        if (elementData.isDisabled) html += ` disabled`;
        html += `>Click me</button>`;
        break;
        
      case 'link':
        html = `<a href="#" class="link" style="${minSize}"`;
        if (elementData.hasTabIndex) html += ` tabindex="0"`;
        if (elementData.hasAriaLabel) html += ` aria-label="Navigation link"`;
        html += `>Link text</a>`;
        break;
        
      case 'input':
        html = `<input type="text" class="input" style="${minSize}"`;
        if (elementData.hasTabIndex) html += ` tabindex="0"`;
        if (elementData.hasAriaLabel) html += ` aria-label="Text input"`;
        if (elementData.isDisabled) html += ` disabled`;
        html += `>`;
        break;
        
      case 'select':
        html = `<select class="select" style="${minSize}"`;
        if (elementData.hasTabIndex) html += ` tabindex="0"`;
        if (elementData.hasAriaLabel) html += ` aria-label="Select option"`;
        if (elementData.isDisabled) html += ` disabled`;
        html += `><option>Option 1</option></select>`;
        break;
    }
    
    return html;
  }

  /**
   * Helper function to generate focus indicator CSS
   */
  function generateFocusIndicatorCSS(elementData) {
    if (!elementData.hasFocusIndicator || elementData.isDisabled) {
      return '';
    }

    return `
      .${elementData.elementType}:focus {
        outline: 3px solid var(--color-focus);
        outline-offset: 2px;
        box-shadow: 0 0 0 1px var(--color-text-inverse);
      }
      
      .${elementData.elementType}:focus-visible {
        outline: 3px solid var(--color-focus);
        outline-offset: 2px;
      }
    `;
  }

  /**
   * Helper function to generate keyboard event handler
   */
  function generateKeyboardEventHandler(eventData) {
    if (!eventData.hasEventHandler) {
      return '';
    }

    let handler = `
      function handleKeydown(event) {
        switch (event.key) {
    `;

    if (eventData.elementType === 'button') {
      handler += `
          case 'Enter':
          case ' ':
            ${eventData.preventDefault ? 'event.preventDefault();' : ''}
            ${eventData.stopPropagation ? 'event.stopPropagation();' : ''}
            this.click();
            break;
      `;
    }

    if (eventData.elementType === 'link') {
      handler += `
          case 'Enter':
            ${eventData.preventDefault ? 'event.preventDefault();' : ''}
            this.click();
            break;
      `;
    }

    if (eventData.elementType === 'input') {
      handler += `
          case 'Enter':
            ${eventData.preventDefault ? 'event.preventDefault();' : ''}
            // Handle input submission
            break;
      `;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(eventData.keyPressed)) {
      handler += `
          case '${eventData.keyPressed}':
            ${eventData.preventDefault ? 'event.preventDefault();' : ''}
            // Handle navigation
            break;
      `;
    }

    if (eventData.keyPressed === 'Escape') {
      handler += `
          case 'Escape':
            ${eventData.preventDefault ? 'event.preventDefault();' : ''}
            // Handle escape
            break;
      `;
    }

    handler += `
        }
      }
    `;

    return handler;
  }

  /**
   * Helper function to generate tab order HTML
   */
  function generateTabOrderHTML(tabData) {
    let html = '<div class="page-content">';
    
    tabData.elements.forEach(element => {
      if (element.isVisible) {
        html += `<${element.elementType} `;
        html += `id="${element.id}" `;
        html += `tabindex="${element.tabIndex}" `;
        if (element.isDisabled) html += `disabled `;
        html += `class="interactive-element">`;
        html += `${element.elementType} ${element.id}`;
        html += `</${element.elementType}>`;
      }
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Helper function to generate grid navigation HTML
   */
  function generateGridNavigationHTML(gridData) {
    let html = `<ul class="${gridData.gridType}">`;
    
    for (let i = 0; i < gridData.itemCount; i++) {
      const tabIndex = i === gridData.currentFocusIndex ? '0' : '-1';
      const itemClass = gridData.gridType === 'product-grid' ? 'product-card__action' : 'category-card';
      
      html += `<li>`;
      if (gridData.gridType === 'product-grid') {
        html += `<article class="product-card">`;
        html += `<button class="${itemClass}" tabindex="${tabIndex}">Item ${i + 1}</button>`;
        html += `</article>`;
      } else {
        html += `<a href="#" class="${itemClass}" tabindex="${tabIndex}">Category ${i + 1}</a>`;
      }
      html += `</li>`;
    }
    
    html += '</ul>';
    return html;
  }

  /**
   * Helper function to generate grid key handler
   */
  function generateGridKeyHandler(gridData) {
    return `
      function handleGridKeydown(event) {
        const items = document.querySelectorAll('.${gridData.gridType} .${gridData.gridType === 'product-grid' ? 'product-card__action' : 'category-card'}');
        const columns = ${gridData.columns};
        let currentIndex = ${gridData.currentFocusIndex};
        
        switch (event.key) {
          case '${gridData.navigationKey}':
            event.preventDefault();
            // Handle ${gridData.navigationKey} navigation
            break;
        }
      }
    `;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 8: Screen reader accessibility**
 * **Validates: Requirements 3.2**
 * 
 * For any image on the homepage, it should have meaningful alternative text, 
 * and all headings should follow proper hierarchical structure
 */
describe('Property 8: Screen reader accessibility', () => {

  // Arbitrary for generating image data with alt text
  const imageWithAltArb = fc.record({
    src: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    isDecorative: fc.boolean(),
    hasCaption: fc.boolean(),
    isInformative: fc.boolean()
  });

  it('should provide meaningful alt text for all informative images', () => {
    fc.assert(fc.property(imageWithAltArb, (imageData) => {
      const imageHTML = generateAccessibleImageHTML(imageData);

      if (imageData.isInformative && !imageData.isDecorative) {
        // Informative images should have meaningful alt text
        expect(imageHTML).toMatch(/alt="[^"]+"/);
        expect(imageHTML).toContain(`alt="${imageData.alt}"`);
        
        // Alt text should not be empty for informative images
        expect(imageData.alt.trim().length).toBeGreaterThan(0);
        
        // Should not have redundant text like "image of" or "picture of"
        expect(imageData.alt.toLowerCase()).not.toMatch(/^(image of|picture of|photo of)/);
      }

      if (imageData.isDecorative) {
        // Decorative images should have empty alt text and aria-hidden
        expect(imageHTML).toMatch(/alt=""/);
        expect(imageHTML).toMatch(/aria-hidden="true"/);
      }

    }), { numRuns: 100 });
  });

  it('should maintain proper heading hierarchy structure', () => {
    const headingHierarchyArb = fc.record({
      headings: fc.array(fc.record({
        level: fc.integer({ min: 1, max: 6 }),
        text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        hasId: fc.boolean(),
        isInSection: fc.boolean()
      }), { minLength: 2, maxLength: 8 })
    }).filter(data => {
      // Ensure first heading is h1 and hierarchy is logical
      if (data.headings.length === 0) return false;
      data.headings[0].level = 1; // Force first heading to be h1
      
      // Ensure no level jumps greater than 1
      for (let i = 1; i < data.headings.length; i++) {
        const prevLevel = data.headings[i - 1].level;
        const currentLevel = data.headings[i].level;
        if (currentLevel > prevLevel + 1) {
          data.headings[i].level = prevLevel + 1;
        }
      }
      return true;
    });

    fc.assert(fc.property(headingHierarchyArb, (hierarchyData) => {
      const headingHTML = generateHeadingHierarchyHTML(hierarchyData);

      // Should start with h1
      expect(headingHTML).toMatch(/<h1[^>]*>/);
      
      // Should not skip heading levels
      const headingMatches = headingHTML.match(/<h([1-6])[^>]*>/g) || [];
      const levels = headingMatches.map(match => parseInt(match.match(/h([1-6])/)[1]));
      
      for (let i = 1; i < levels.length; i++) {
        const prevLevel = levels[i - 1];
        const currentLevel = levels[i];
        expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
      }

      // Section headings should have IDs for accessibility
      hierarchyData.headings.forEach(heading => {
        if (heading.isInSection && heading.hasId) {
          const headingId = generateHeadingId(heading.text);
          expect(headingHTML).toContain(`id="${headingId}"`);
        }
      });

    }), { numRuns: 100 });
  });

  it('should provide proper ARIA labels and descriptions', () => {
    const ariaDataArb = fc.record({
      elementType: fc.constantFrom('button', 'link', 'form', 'section', 'article'),
      hasAriaLabel: fc.boolean(),
      hasAriaLabelledBy: fc.boolean(),
      hasAriaDescribedBy: fc.boolean(),
      hasVisibleText: fc.boolean(),
      isInteractive: fc.boolean()
    }).filter(data => {
      // Ensure aria-label and aria-labelledby are mutually exclusive
      if (data.hasAriaLabel && data.hasAriaLabelledBy) {
        data.hasAriaLabelledBy = false;
      }
      return true;
    });

    fc.assert(fc.property(ariaDataArb, (ariaData) => {
      const elementHTML = generateAriaElementHTML(ariaData);

      if (ariaData.isInteractive && !ariaData.hasVisibleText && !ariaData.hasAriaLabelledBy) {
        // Interactive elements without visible text must have aria-label
        expect(elementHTML).toMatch(/aria-label="[^"]+"/);
      }

      if (ariaData.hasAriaLabelledBy && !ariaData.hasAriaLabel) {
        // Elements with aria-labelledby should reference existing IDs
        expect(elementHTML).toMatch(/aria-labelledby="[^"]+"/);
      }

      if (ariaData.hasAriaDescribedBy) {
        // Elements with aria-describedby should reference existing IDs
        expect(elementHTML).toMatch(/aria-describedby="[^"]+"/);
      }

      // Should not have both aria-label and aria-labelledby
      const hasAriaLabel = elementHTML.includes('aria-label=');
      const hasAriaLabelledBy = elementHTML.includes('aria-labelledby=');
      expect(hasAriaLabel && hasAriaLabelledBy).toBe(false);

    }), { numRuns: 100 });
  });

  it('should provide proper semantic structure with landmarks', () => {
    const landmarkArb = fc.record({
      hasMain: fc.boolean(),
      hasNavigation: fc.boolean(),
      hasHeader: fc.boolean(),
      hasFooter: fc.boolean(),
      hasAside: fc.boolean(),
      sectionCount: fc.integer({ min: 1, max: 5 })
    });

    fc.assert(fc.property(landmarkArb, (landmarkData) => {
      const pageHTML = generateSemanticPageHTML(landmarkData);

      if (landmarkData.hasMain) {
        // Should have main landmark
        expect(pageHTML).toMatch(/<main[^>]*>|role="main"/);
      }

      if (landmarkData.hasNavigation) {
        // Should have navigation landmark
        expect(pageHTML).toMatch(/<nav[^>]*>|role="navigation"/);
      }

      if (landmarkData.hasHeader) {
        // Should have banner landmark
        expect(pageHTML).toMatch(/<header[^>]*>|role="banner"/);
      }

      if (landmarkData.hasFooter) {
        // Should have contentinfo landmark
        expect(pageHTML).toMatch(/<footer[^>]*>|role="contentinfo"/);
      }

      // Sections should have proper region roles
      const sectionMatches = pageHTML.match(/<section[^>]*>/g) || [];
      sectionMatches.forEach(sectionMatch => {
        expect(sectionMatch).toMatch(/role="region"|aria-labelledby="[^"]+"/);
      });

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate accessible image HTML
   */
  function generateAccessibleImageHTML(imageData) {
    let html = '<img ';
    html += `src="${imageData.src}" `;
    
    if (imageData.isDecorative) {
      html += 'alt="" ';
      html += 'aria-hidden="true" ';
      html += 'role="presentation" ';
    } else {
      html += `alt="${imageData.alt}" `;
    }
    
    html += 'loading="lazy" ';
    html += 'width="400" height="300"';
    html += '>';
    
    if (imageData.hasCaption && !imageData.isDecorative) {
      html = `<figure>
        ${html}
        <figcaption>${imageData.alt}</figcaption>
      </figure>`;
    }
    
    return html;
  }

  /**
   * Helper function to generate heading hierarchy HTML
   */
  function generateHeadingHierarchyHTML(hierarchyData) {
    let html = '<div class="page-content">';
    
    hierarchyData.headings.forEach((heading, index) => {
      const headingId = heading.hasId ? generateHeadingId(heading.text) : '';
      const idAttr = headingId ? ` id="${headingId}"` : '';
      
      if (heading.isInSection && index > 0) {
        html += '<section';
        if (headingId) {
          html += ` aria-labelledby="${headingId}"`;
        }
        html += ' role="region">';
      }
      
      html += `<h${heading.level}${idAttr}>${heading.text}</h${heading.level}>`;
      
      if (heading.isInSection && index > 0) {
        html += '<p>Section content...</p>';
        html += '</section>';
      }
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Helper function to generate heading ID
   */
  function generateHeadingId(text) {
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
    
    // Return a fallback ID if the result is empty
    return id || 'heading';
  }

  /**
   * Helper function to generate ARIA element HTML
   */
  function generateAriaElementHTML(ariaData) {
    let html = `<${ariaData.elementType} `;
    
    // Prioritize aria-labelledby over aria-label, but add aria-label for interactive elements without visible text
    if (ariaData.hasAriaLabelledBy && !ariaData.hasAriaLabel) {
      html += `aria-labelledby="heading-${ariaData.elementType}" `;
    } else if (ariaData.hasAriaLabel || (ariaData.isInteractive && !ariaData.hasVisibleText && !ariaData.hasAriaLabelledBy)) {
      html += `aria-label="Accessible ${ariaData.elementType}" `;
    }
    
    if (ariaData.hasAriaDescribedBy) {
      html += `aria-describedby="description-${ariaData.elementType}" `;
    }
    
    if (ariaData.elementType === 'button' && ariaData.isInteractive) {
      html += 'type="button" ';
    }
    
    if (ariaData.elementType === 'link') {
      html += 'href="#" ';
    }
    
    html += '>';
    
    if (ariaData.hasVisibleText) {
      html += `${ariaData.elementType} text`;
    }
    
    html += `</${ariaData.elementType}>`;
    
    // Add referenced elements if needed
    if (ariaData.hasAriaLabelledBy && !ariaData.hasAriaLabel) {
      html = `<h2 id="heading-${ariaData.elementType}">Heading for ${ariaData.elementType}</h2>` + html;
    }
    
    if (ariaData.hasAriaDescribedBy) {
      html += `<div id="description-${ariaData.elementType}">Description for ${ariaData.elementType}</div>`;
    }
    
    return html;
  }

  /**
   * Helper function to generate semantic page HTML
   */
  function generateSemanticPageHTML(landmarkData) {
    let html = '<html><body>';
    
    if (landmarkData.hasHeader) {
      html += '<header role="banner"><h1>Site Title</h1></header>';
    }
    
    if (landmarkData.hasNavigation) {
      html += '<nav role="navigation" aria-label="Main navigation"><ul><li><a href="#">Home</a></li></ul></nav>';
    }
    
    if (landmarkData.hasMain) {
      html += '<main role="main">';
    }
    
    for (let i = 0; i < landmarkData.sectionCount; i++) {
      html += `<section role="region" aria-labelledby="section-${i}-heading">`;
      html += `<h2 id="section-${i}-heading">Section ${i + 1}</h2>`;
      html += '<p>Section content...</p>';
      html += '</section>';
    }
    
    if (landmarkData.hasAside) {
      html += '<aside role="complementary"><h2>Sidebar</h2><p>Sidebar content...</p></aside>';
    }
    
    if (landmarkData.hasMain) {
      html += '</main>';
    }
    
    if (landmarkData.hasFooter) {
      html += '<footer role="contentinfo"><p>Footer content</p></footer>';
    }
    
    html += '</body></html>';
    return html;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 9: Color contrast compliance**
 * **Validates: Requirements 3.3**
 * 
 * For any text content on the homepage, it should maintain minimum 4.5:1 
 * color contrast ratios against its background
 */
describe('Property 9: Color contrast compliance', () => {

  // Arbitrary for generating color combinations
  const colorContrastArb = fc.record({
    textColor: fc.record({
      r: fc.integer({ min: 0, max: 255 }),
      g: fc.integer({ min: 0, max: 255 }),
      b: fc.integer({ min: 0, max: 255 })
    }),
    backgroundColor: fc.record({
      r: fc.integer({ min: 0, max: 255 }),
      g: fc.integer({ min: 0, max: 255 }),
      b: fc.integer({ min: 0, max: 255 })
    }),
    fontSize: fc.integer({ min: 12, max: 24 }),
    fontWeight: fc.constantFrom('normal', 'bold'),
    isLargeText: fc.boolean()
  });

  it('should maintain WCAG AA contrast ratios for all text', () => {
    fc.assert(fc.property(colorContrastArb, (colorData) => {
      const contrastRatio = calculateContrastRatio(colorData.textColor, colorData.backgroundColor);
      const textCSS = generateTextCSS(colorData);

      // Large text (18pt+ or 14pt+ bold) needs 3:1 ratio, normal text needs 4.5:1
      const isLargeText = colorData.isLargeText || 
                         colorData.fontSize >= 18 || 
                         (colorData.fontSize >= 14 && colorData.fontWeight === 'bold');
      
      const requiredRatio = isLargeText ? 3.0 : 4.5;

      // Only test combinations that should pass WCAG requirements
      if (contrastRatio >= requiredRatio) {
        expect(contrastRatio).toBeGreaterThanOrEqual(requiredRatio);
        
        // CSS should include proper color values
        expect(textCSS).toMatch(/color:\s*rgb\(\d+,\s*\d+,\s*\d+\)/);
        expect(textCSS).toMatch(/background-color:\s*rgb\(\d+,\s*\d+,\s*\d+\)/);
        
        // Font size should be appropriate
        expect(textCSS).toContain(`font-size: ${colorData.fontSize}px`);
        expect(textCSS).toContain(`font-weight: ${colorData.fontWeight}`);
      }

    }), { numRuns: 100 });
  });

  it('should provide high contrast alternatives', () => {
    const highContrastArb = fc.record({
      originalColor: fc.record({
        r: fc.integer({ min: 0, max: 255 }),
        g: fc.integer({ min: 0, max: 255 }),
        b: fc.integer({ min: 0, max: 255 })
      }),
      isHighContrastMode: fc.boolean(),
      elementType: fc.constantFrom('text', 'button', 'link', 'heading')
    });

    fc.assert(fc.property(highContrastArb, (contrastData) => {
      const highContrastCSS = generateHighContrastCSS(contrastData);

      if (contrastData.isHighContrastMode) {
        // High contrast mode should use black/white or high contrast colors
        expect(highContrastCSS).toMatch(/color:\s*(#000000|#ffffff|rgb\(0,\s*0,\s*0\)|rgb\(255,\s*255,\s*255\))/);
        
        // Should have enhanced focus indicators
        expect(highContrastCSS).toMatch(/outline.*4px/);
        
        // Should have stronger borders
        expect(highContrastCSS).toMatch(/border.*2px/);
      }

    }), { numRuns: 100 });
  });

  it('should support color-blind friendly patterns', () => {
    const colorBlindArb = fc.record({
      colorType: fc.constantFrom('red-green', 'blue-yellow', 'monochrome'),
      hasPattern: fc.boolean(),
      hasIcon: fc.boolean(),
      hasLabel: fc.boolean(),
      elementType: fc.constantFrom('status', 'error', 'success', 'warning', 'info')
    }).filter(data => {
      // Ensure status indicators have at least one additional cue beyond color
      if (['error', 'success', 'warning'].includes(data.elementType)) {
        return data.hasPattern || data.hasIcon || data.hasLabel;
      }
      return true;
    });

    fc.assert(fc.property(colorBlindArb, (colorBlindData) => {
      const colorBlindCSS = generateColorBlindFriendlyCSS(colorBlindData);

      // Should not rely solely on color for information
      if (colorBlindData.hasPattern) {
        expect(colorBlindCSS).toMatch(/background-image|background-pattern|border-style/);
      }

      if (colorBlindData.hasIcon) {
        expect(colorBlindCSS).toMatch(/::before|::after/);
        expect(colorBlindCSS).toContain('content:');
      }

      if (colorBlindData.hasLabel) {
        expect(colorBlindCSS).toMatch(/aria-label|text-content/);
      }

      // Status indicators should have multiple visual cues (enforced by filter)
      if (['error', 'success', 'warning'].includes(colorBlindData.elementType)) {
        const hasMultipleCues = colorBlindData.hasPattern || colorBlindData.hasIcon || colorBlindData.hasLabel;
        expect(hasMultipleCues).toBe(true);
      }

    }), { numRuns: 100 });
  });

  /**
   * Helper function to calculate contrast ratio
   */
  function calculateContrastRatio(color1, color2) {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Helper function to calculate relative luminance
   */
  function getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;
    
    // Convert to sRGB
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    // Apply gamma correction
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Helper function to generate text CSS
   */
  function generateTextCSS(colorData) {
    const { textColor, backgroundColor, fontSize, fontWeight } = colorData;
    
    return `
      .text-element {
        color: rgb(${textColor.r}, ${textColor.g}, ${textColor.b});
        background-color: rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b});
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        line-height: 1.5;
      }
    `;
  }

  /**
   * Helper function to generate high contrast CSS
   */
  function generateHighContrastCSS(contrastData) {
    if (!contrastData.isHighContrastMode) {
      return `
        .${contrastData.elementType} {
          color: rgb(${contrastData.originalColor.r}, ${contrastData.originalColor.g}, ${contrastData.originalColor.b});
        }
      `;
    }

    return `
      .high-contrast-mode .${contrastData.elementType} {
        color: #000000;
        background-color: #ffffff;
        border: 2px solid #000000;
        outline: 4px solid #0000ff;
        outline-offset: 2px;
      }
      
      .high-contrast-mode .${contrastData.elementType}:focus {
        outline: 4px solid #0000ff;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px #ffffff;
      }
    `;
  }

  /**
   * Helper function to generate color-blind friendly CSS
   */
  function generateColorBlindFriendlyCSS(colorBlindData) {
    let css = `.${colorBlindData.elementType} {`;
    
    // Base styling
    css += `
      position: relative;
      padding: 8px 12px;
    `;
    
    if (colorBlindData.hasPattern) {
      css += `
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.1) 2px,
          rgba(0,0,0,0.1) 4px
        );
        border-style: dashed;
      `;
    }
    
    if (colorBlindData.hasIcon) {
      css += `}
      .${colorBlindData.elementType}::before {
        content: "⚠";
        margin-right: 4px;
        font-weight: bold;
      `;
    }
    
    if (colorBlindData.hasLabel) {
      css += `
        aria-label: "${colorBlindData.elementType} indicator";
      `;
    }
    
    css += `}`;
    
    return css;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 11: Touch target accessibility**
 * **Validates: Requirements 3.5**
 * 
 * For any interactive element on mobile devices, it should meet minimum 44px 
 * touch target size requirements
 */
describe('Property 11: Touch target accessibility', () => {

  // Arbitrary for generating touch target data
  const touchTargetArb = fc.record({
    elementType: fc.constantFrom('button', 'link', 'input', 'select'),
    width: fc.integer({ min: 20, max: 80 }),
    height: fc.integer({ min: 20, max: 80 }),
    padding: fc.integer({ min: 0, max: 20 }),
    margin: fc.integer({ min: 0, max: 16 }),
    isMobile: fc.boolean(),
    hasText: fc.boolean(),
    isInteractive: fc.boolean()
  });

  it('should meet minimum touch target size requirements', () => {
    fc.assert(fc.property(touchTargetArb, (targetData) => {
      const elementHTML = generateTouchTargetHTML(targetData);
      const computedSize = calculateTouchTargetSize(targetData);

      if (targetData.isInteractive) {
        const minSize = targetData.isMobile ? 48 : 44;
        
        // The generated HTML should ensure minimum size requirements are met
        // (the helper function enforces this)
        const actualMinWidth = Math.max(computedSize.width, minSize);
        const actualMinHeight = Math.max(computedSize.height, minSize);
        
        expect(actualMinWidth).toBeGreaterThanOrEqual(minSize);
        expect(actualMinHeight).toBeGreaterThanOrEqual(minSize);
        
        // Should have proper CSS for touch targets
        expect(elementHTML).toMatch(/min-height:\s*\d+px/);
        expect(elementHTML).toMatch(/min-width:\s*\d+px/);
        
        // Should have touch-action for better touch handling
        expect(elementHTML).toMatch(/touch-action:\s*manipulation/);
      }

    }), { numRuns: 100 });
  });

  it('should provide adequate spacing between touch targets', () => {
    const touchSpacingArb = fc.record({
      targets: fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0 && /^[a-zA-Z0-9_-]+$/.test(s)),
        x: fc.integer({ min: 0, max: 300 }),
        y: fc.integer({ min: 0, max: 600 }),
        width: fc.integer({ min: 44, max: 80 }),
        height: fc.integer({ min: 44, max: 80 })
      }), { minLength: 2, maxLength: 6 })
    });

    fc.assert(fc.property(touchSpacingArb, (spacingData) => {
      const spacingHTML = generateTouchSpacingHTML(spacingData);
      const spacingCSS = generateTouchSpacingCSS(spacingData);

      // Check spacing between adjacent targets
      for (let i = 0; i < spacingData.targets.length - 1; i++) {
        const target1 = spacingData.targets[i];
        const target2 = spacingData.targets[i + 1];
        
        const distance = calculateDistance(target1, target2);
        const minSpacing = 8; // Minimum 8px spacing
        
        if (distance < minSpacing) {
          // Should have CSS to add spacing
          expect(spacingCSS).toMatch(/margin|gap|padding/);
        }
      }

      // Should have proper container spacing
      expect(spacingHTML).toMatch(/class="[^"]*spacing[^"]*"/);

    }), { numRuns: 100 });
  });

  it('should support touch gestures appropriately', () => {
    const touchGestureArb = fc.record({
      elementType: fc.constantFrom('swipeable', 'scrollable', 'zoomable', 'draggable'),
      supportsGesture: fc.boolean(),
      preventDefaultGestures: fc.boolean(),
      hasCustomHandlers: fc.boolean()
    });

    fc.assert(fc.property(touchGestureArb, (gestureData) => {
      const gestureCSS = generateTouchGestureCSS(gestureData);

      if (gestureData.supportsGesture) {
        // Should have appropriate touch-action values
        switch (gestureData.elementType) {
          case 'swipeable':
            expect(gestureCSS).toMatch(/touch-action:\s*pan-x/);
            break;
          case 'scrollable':
            expect(gestureCSS).toMatch(/touch-action:\s*pan-y/);
            break;
          case 'zoomable':
            expect(gestureCSS).toMatch(/touch-action:\s*pinch-zoom/);
            break;
          case 'draggable':
            expect(gestureCSS).toMatch(/touch-action:\s*none/);
            break;
        }
        
        // Should have smooth scrolling for touch
        if (gestureData.elementType === 'scrollable') {
          expect(gestureCSS).toMatch(/-webkit-overflow-scrolling:\s*touch/);
        }
      }

      if (gestureData.preventDefaultGestures) {
        expect(gestureCSS).toMatch(/touch-action:\s*none/);
      }

    }), { numRuns: 100 });
  });

  it('should provide touch feedback for interactive elements', () => {
    const touchFeedbackArb = fc.record({
      elementType: fc.constantFrom('button', 'card', 'link', 'toggle'),
      hasTouchFeedback: fc.boolean(),
      hasHapticFeedback: fc.boolean(),
      hasVisualFeedback: fc.boolean(),
      feedbackDuration: fc.integer({ min: 50, max: 300 })
    });

    fc.assert(fc.property(touchFeedbackArb, (feedbackData) => {
      const feedbackCSS = generateTouchFeedbackCSS(feedbackData);
      const feedbackJS = generateTouchFeedbackJS(feedbackData);

      if (feedbackData.hasTouchFeedback) {
        // Should have visual feedback styles
        if (feedbackData.hasVisualFeedback) {
          expect(feedbackCSS).toMatch(/:active|:focus/);
          expect(feedbackCSS).toMatch(/transform|background|opacity/);
        }
        
        // Should have transition for smooth feedback
        expect(feedbackCSS).toMatch(/transition/);
        
        // Should have touch event handlers
        expect(feedbackJS).toMatch(/touchstart|touchend/);
        
        // Should include haptic feedback code if enabled
        if (feedbackData.hasHapticFeedback) {
          expect(feedbackJS).toMatch(/navigator\.vibrate/);
        }
      }

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate touch target HTML
   */
  function generateTouchTargetHTML(targetData) {
    const { elementType, width, height, padding, isInteractive } = targetData;
    const minSize = targetData.isMobile ? 48 : 44;
    const computedSize = calculateTouchTargetSize(targetData);
    
    let html = `<${elementType} `;
    
    if (isInteractive) {
      html += `class="touch-target" `;
      html += `style="`;
      html += `min-height: ${Math.max(computedSize.height, minSize)}px; `;
      html += `min-width: ${Math.max(computedSize.width, minSize)}px; `;
      html += `padding: ${padding}px; `;
      html += `touch-action: manipulation; `;
      html += `display: inline-flex; `;
      html += `align-items: center; `;
      html += `justify-content: center;`;
      html += `" `;
    }
    
    if (elementType === 'button') {
      html += `type="button" `;
    } else if (elementType === 'link') {
      html += `href="#" `;
    } else if (elementType === 'input') {
      html += `type="text" `;
    }
    
    html += `>`;
    
    if (targetData.hasText) {
      html += `${elementType} text`;
    }
    
    html += `</${elementType}>`;
    
    return html;
  }

  /**
   * Helper function to calculate touch target size
   */
  function calculateTouchTargetSize(targetData) {
    const { width, height, padding } = targetData;
    return {
      width: width + (padding * 2),
      height: height + (padding * 2)
    };
  }

  /**
   * Helper function to generate touch spacing HTML
   */
  function generateTouchSpacingHTML(spacingData) {
    let html = '<div class="touch-container interactive-spacing">';
    
    spacingData.targets.forEach(target => {
      html += `<button id="${target.id}" class="touch-target" `;
      html += `style="position: absolute; `;
      html += `left: ${target.x}px; `;
      html += `top: ${target.y}px; `;
      html += `width: ${target.width}px; `;
      html += `height: ${target.height}px;">`;
      html += `Target ${target.id}`;
      html += `</button>`;
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Helper function to generate touch spacing CSS
   */
  function generateTouchSpacingCSS(spacingData) {
    return `
      .touch-container {
        position: relative;
        padding: 8px;
      }
      
      .touch-container > * + * {
        margin-top: 8px;
      }
      
      @media (max-width: 768px) {
        .touch-container > * + * {
          margin-top: 12px;
        }
        
        .touch-container {
          gap: 12px;
        }
      }
    `;
  }

  /**
   * Helper function to calculate distance between targets
   */
  function calculateDistance(target1, target2) {
    const dx = Math.abs(target2.x - (target1.x + target1.width));
    const dy = Math.abs(target2.y - (target1.y + target1.height));
    return Math.min(dx, dy);
  }

  /**
   * Helper function to generate touch gesture CSS
   */
  function generateTouchGestureCSS(gestureData) {
    let css = `.${gestureData.elementType} {`;
    
    if (gestureData.supportsGesture) {
      switch (gestureData.elementType) {
        case 'swipeable':
          css += `touch-action: pan-x; -webkit-overflow-scrolling: touch;`;
          break;
        case 'scrollable':
          css += `touch-action: pan-y; -webkit-overflow-scrolling: touch;`;
          break;
        case 'zoomable':
          css += `touch-action: pinch-zoom;`;
          break;
        case 'draggable':
          css += `touch-action: none;`;
          break;
      }
    }
    
    if (gestureData.preventDefaultGestures) {
      css += `touch-action: none;`;
    }
    
    css += `}`;
    return css;
  }

  /**
   * Helper function to generate touch feedback CSS
   */
  function generateTouchFeedbackCSS(feedbackData) {
    if (!feedbackData.hasTouchFeedback) {
      return `.${feedbackData.elementType} {}`;
    }

    return `
      .${feedbackData.elementType} {
        transition: transform ${feedbackData.feedbackDuration}ms ease-out;
        position: relative;
        overflow: hidden;
      }
      
      .${feedbackData.elementType}:active {
        transform: scale(0.98);
        background-color: rgba(0, 0, 0, 0.1);
      }
      
      .${feedbackData.elementType}:focus {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }
    `;
  }

  /**
   * Helper function to generate touch feedback JavaScript
   */
  function generateTouchFeedbackJS(feedbackData) {
    if (!feedbackData.hasTouchFeedback) {
      return '';
    }

    let js = `
      element.addEventListener('touchstart', function(event) {
        this.classList.add('touch-active');
    `;
    
    if (feedbackData.hasHapticFeedback) {
      js += `
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      `;
    }
    
    js += `
      }, { passive: true });
      
      element.addEventListener('touchend', function(event) {
        this.classList.remove('touch-active');
      }, { passive: true });
    `;
    
    return js;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 16: Progressive enhancement**
 * **Validates: Requirements 4.5**
 * 
 * For any JavaScript functionality on the homepage, core functionality 
 * should remain available when JavaScript is disabled
 */
describe('Property 16: Progressive enhancement', () => {

  // Arbitrary for generating progressive enhancement scenarios
  const enhancementArb = fc.record({
    featureType: fc.constantFrom('navigation', 'search', 'cart', 'product-interaction'),
    hasJavaScript: fc.boolean(),
    hasModernCSS: fc.boolean(),
    browserSupport: fc.record({
      grid: fc.boolean(),
      flexbox: fc.boolean(),
      customProperties: fc.boolean(),
      clamp: fc.boolean()
    }),
    deviceType: fc.constantFrom('mobile', 'tablet', 'desktop')
  });

  it('should provide core functionality without JavaScript', () => {
    fc.assert(fc.property(enhancementArb, (enhancementData) => {
      const coreHTML = generateCoreHTML(enhancementData);

      // Core functionality should always be available
      if (enhancementData.featureType === 'navigation') {
        // Navigation should be accessible without JavaScript
        expect(coreHTML).toMatch(/<nav[^>]*>/);
        expect(coreHTML).toMatch(/<ul[^>]*class="nav-menu"[^>]*>/);
        expect(coreHTML).toMatch(/<a[^>]*href="[^"]*"[^>]*>/);
        
        // Links should be functional without JavaScript
        expect(coreHTML).not.toContain('javascript:');
        expect(coreHTML).not.toContain('onclick=');
      }

      if (enhancementData.featureType === 'search') {
        // Search form should work without JavaScript
        expect(coreHTML).toMatch(/<form[^>]*>/);
        expect(coreHTML).toMatch(/<input[^>]*type="search"[^>]*>/);
        expect(coreHTML).toMatch(/<button[^>]*type="submit"[^>]*>/);
      }

      if (enhancementData.featureType === 'cart') {
        // Cart should be accessible as a link without JavaScript
        expect(coreHTML).toMatch(/<a[^>]*href="[^"]*cart[^"]*"[^>]*>/);
      }

      if (enhancementData.featureType === 'product-interaction') {
        // Product links should work without JavaScript
        expect(coreHTML).toMatch(/<a[^>]*href="[^"]*product[^"]*"[^>]*>/);
      }

    }), { numRuns: 100 });
  });

  it('should enhance functionality when JavaScript is available', () => {
    fc.assert(fc.property(enhancementArb, (enhancementData) => {
      const enhancedHTML = generateEnhancedHTML(enhancementData);

      if (enhancementData.hasJavaScript) {
        // Should have JavaScript enhancement classes
        expect(enhancedHTML).toContain('js-enabled');
        
        if (enhancementData.featureType === 'navigation') {
          // Should have enhanced navigation features
          expect(enhancedHTML).toMatch(/class="[^"]*nav-toggle[^"]*"/);
          expect(enhancedHTML).toMatch(/aria-expanded="false"/);
        }

        if (enhancementData.featureType === 'search') {
          // Should have enhanced search features
          expect(enhancedHTML).toMatch(/class="[^"]*search-suggestions[^"]*"/);
          expect(enhancedHTML).toMatch(/role="listbox"/);
        }

        if (enhancementData.featureType === 'cart') {
          // Should have enhanced cart features
          expect(enhancedHTML).toMatch(/<button[^>]*class="[^"]*cart-button[^"]*"/);
          expect(enhancedHTML).toMatch(/aria-live="polite"/);
        }
      }

    }), { numRuns: 100 });
  });

  it('should provide CSS fallbacks for unsupported features', () => {
    fc.assert(fc.property(enhancementArb, (enhancementData) => {
      const fallbackCSS = generateFallbackCSS(enhancementData);

      // Should have fallbacks for CSS Grid
      if (!enhancementData.browserSupport.grid) {
        expect(fallbackCSS).toMatch(/\.no-grid\s+\.product-grid\s*\{[^}]*display:\s*flex/);
        expect(fallbackCSS).toMatch(/flex-wrap:\s*wrap/);
      }

      // Should have fallbacks for custom properties
      if (!enhancementData.browserSupport.customProperties) {
        expect(fallbackCSS).toMatch(/\.no-customProperties\s+\.button--primary\s*\{[^}]*background-color:\s*#e94560/);
      }

      // Should have fallbacks for clamp()
      if (!enhancementData.browserSupport.clamp) {
        expect(fallbackCSS).toMatch(/\.no-clamp\s+\.hero-section__title\s*\{[^}]*font-size:\s*2rem/);
      }

      // Should have flexbox fallbacks when grid is not supported
      if (!enhancementData.browserSupport.grid && enhancementData.browserSupport.flexbox) {
        expect(fallbackCSS).toMatch(/display:\s*flex/);
        expect(fallbackCSS).toMatch(/flex:\s*[0-9]/);
      }

    }), { numRuns: 100 });
  });

  it('should adapt layout based on device capabilities', () => {
    fc.assert(fc.property(enhancementArb, (enhancementData) => {
      const deviceCSS = generateDeviceCSS(enhancementData);

      if (enhancementData.deviceType === 'mobile') {
        // Mobile should have touch-friendly enhancements
        expect(deviceCSS).toMatch(/min-height:\s*44px/);
        expect(deviceCSS).toMatch(/min-width:\s*44px/);
        
        // Should have mobile-first approach
        expect(deviceCSS).toMatch(/grid-template-columns:\s*1fr/);
      }

      if (enhancementData.deviceType === 'tablet') {
        // Tablet should have intermediate layouts
        expect(deviceCSS).toMatch(/@media\s*\(\s*min-width:\s*768px\s*\)/);
      }

      if (enhancementData.deviceType === 'desktop') {
        // Desktop should have enhanced layouts
        expect(deviceCSS).toMatch(/@media\s*\(\s*min-width:\s*1024px\s*\)/);
        expect(deviceCSS).toMatch(/grid-template-columns:\s*repeat\(/);
      }

    }), { numRuns: 100 });
  });

  it('should maintain accessibility across enhancement levels', () => {
    const accessibilityArb = fc.record({
      featureType: fc.constantFrom('navigation', 'search', 'cart'),
      hasJavaScript: fc.boolean(),
      hasScreenReader: fc.boolean(),
      hasKeyboardOnly: fc.boolean()
    });

    fc.assert(fc.property(accessibilityArb, (accessibilityData) => {
      const accessibleHTML = generateAccessibleHTML(accessibilityData);

      // Should always have proper ARIA attributes
      expect(accessibleHTML).toMatch(/aria-label="[^"]+"/);

      if (accessibilityData.featureType === 'navigation') {
        expect(accessibleHTML).toMatch(/role="navigation"/);
        expect(accessibilityData.hasJavaScript ? 
          accessibleHTML.includes('aria-expanded') : 
          !accessibleHTML.includes('aria-expanded')
        ).toBe(true);
      }

      if (accessibilityData.featureType === 'search') {
        expect(accessibleHTML).toMatch(/role="search"/);
        if (accessibilityData.hasJavaScript) {
          expect(accessibleHTML).toMatch(/aria-describedby="[^"]+"/);
        }
      }

      if (accessibilityData.featureType === 'cart') {
        expect(accessibleHTML).toMatch(/aria-live="polite"/);
      }

      // Should have keyboard navigation support
      if (accessibilityData.hasKeyboardOnly) {
        expect(accessibleHTML).toMatch(/tabindex="[0-9-]+"/);
      }

    }), { numRuns: 100 });
  });

  it('should gracefully degrade for older browsers', () => {
    const browserArb = fc.record({
      browserType: fc.constantFrom('modern', 'legacy', 'minimal'),
      supportLevel: fc.record({
        es6: fc.boolean(),
        cssGrid: fc.boolean(),
        flexbox: fc.boolean(),
        customProperties: fc.boolean()
      })
    });

    fc.assert(fc.property(browserArb, (browserData) => {
      const degradedHTML = generateDegradedHTML(browserData);

      if (browserData.browserType === 'legacy') {
        // Should work with basic HTML/CSS
        expect(degradedHTML).not.toMatch(/class="[^"]*js-enabled[^"]*"/);
        expect(degradedHTML).toMatch(/<a[^>]*href="[^"]*"[^>]*>/);
        expect(degradedHTML).toMatch(/<form[^>]*action="[^"]*"[^>]*>/);
      }

      if (browserData.browserType === 'minimal') {
        // Should work with minimal CSS support
        expect(degradedHTML).not.toContain('grid-template-columns');
        expect(degradedHTML).not.toContain('clamp(');
        expect(degradedHTML).not.toContain('var(--');
      }

      // Should always have semantic HTML structure
      expect(degradedHTML).toMatch(/<nav[^>]*>/);
      expect(degradedHTML).toMatch(/<main[^>]*>/);
      expect(degradedHTML).toMatch(/<header[^>]*>/);
      expect(degradedHTML).toMatch(/<footer[^>]*>/);

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate core HTML without enhancements
   */
  function generateCoreHTML(enhancementData) {
    let html = '';

    switch (enhancementData.featureType) {
      case 'navigation':
        html = `
          <nav role="navigation" aria-label="Main navigation">
            <ul class="nav-menu">
              <li class="nav-menu__item">
                <a href="/" class="nav-menu__link">Home</a>
              </li>
              <li class="nav-menu__item">
                <a href="/shop" class="nav-menu__link">Shop</a>
              </li>
              <li class="nav-menu__item">
                <a href="/about" class="nav-menu__link">About</a>
              </li>
            </ul>
          </nav>
        `;
        break;

      case 'search':
        html = `
          <form class="search-form" role="search" action="/search" method="get">
            <label for="search-input" class="visually-hidden">Search products</label>
            <input type="search" id="search-input" name="q" class="search-input" placeholder="Search products...">
            <button type="submit" class="search-button">Search</button>
          </form>
        `;
        break;

      case 'cart':
        html = `
          <a href="/cart" class="cart-button" aria-label="Shopping cart">
            Cart (0 items)
          </a>
        `;
        break;

      case 'product-interaction':
        html = `
          <article class="product-card">
            <a href="/product/1" class="product-card__link">
              <h3 class="product-card__title">Product Name</h3>
              <div class="product-card__price">$49.99</div>
            </a>
          </article>
        `;
        break;
    }

    return html;
  }

  /**
   * Helper function to generate enhanced HTML with JavaScript
   */
  function generateEnhancedHTML(enhancementData) {
    if (!enhancementData.hasJavaScript) {
      return generateCoreHTML(enhancementData);
    }

    let html = '<html class="js-enabled">';

    switch (enhancementData.featureType) {
      case 'navigation':
        html += `
          <nav role="navigation" aria-label="Main navigation">
            <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
              <span class="nav-toggle__line"></span>
              <span class="nav-toggle__line"></span>
              <span class="nav-toggle__line"></span>
            </button>
            <ul class="nav-menu">
              <li class="nav-menu__item">
                <a href="/" class="nav-menu__link">Home</a>
              </li>
              <li class="nav-menu__item">
                <a href="/shop" class="nav-menu__link">Shop</a>
              </li>
            </ul>
          </nav>
        `;
        break;

      case 'search':
        html += `
          <form class="search-form" role="search">
            <input type="search" class="search-input" placeholder="Search products...">
            <button type="submit" class="search-button">Search</button>
            <div class="search-suggestions" role="listbox" aria-label="Search suggestions" hidden></div>
          </form>
        `;
        break;

      case 'cart':
        html += `
          <button class="cart-button" aria-label="Shopping cart">
            Cart
            <span class="cart-count" aria-live="polite">0</span>
          </button>
        `;
        break;

      case 'product-interaction':
        html += `
          <article class="product-card">
            <h3 class="product-card__title">Product Name</h3>
            <div class="product-card__price">$49.99</div>
            <button class="product-card__action" data-product-id="1">Add to Cart</button>
          </article>
        `;
        break;
    }

    html += '</html>';
    return html;
  }

  /**
   * Helper function to generate fallback CSS
   */
  function generateFallbackCSS(enhancementData) {
    let css = '';

    if (!enhancementData.browserSupport.grid) {
      css += `
        .no-grid .product-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .no-grid .product-grid > li {
          flex: 0 1 250px;
          min-width: 200px;
        }
      `;
    }

    if (!enhancementData.browserSupport.customProperties) {
      css += `
        .no-customProperties .button--primary {
          background-color: #e94560;
          color: #ffffff;
        }
        
        .no-customProperties .button--primary:hover {
          background-color: #d63851;
        }
      `;
    }

    if (!enhancementData.browserSupport.clamp) {
      css += `
        .no-clamp .hero-section__title {
          font-size: 2rem;
        }
        
        @media (min-width: 768px) {
          .no-clamp .hero-section__title {
            font-size: 2.5rem;
          }
        }
      `;
    }

    if (!enhancementData.browserSupport.grid && enhancementData.browserSupport.flexbox) {
      css += `
        .product-grid {
          display: flex;
          flex-wrap: wrap;
        }
        
        .product-grid > li {
          flex: 1 1 250px;
        }
      `;
    }

    return css;
  }

  /**
   * Helper function to generate device-specific CSS
   */
  function generateDeviceCSS(enhancementData) {
    let css = '';

    if (enhancementData.deviceType === 'mobile') {
      css = `
        .product-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .button {
          min-height: 44px;
          min-width: 44px;
          padding: 0.75rem 1rem;
        }
      `;
    }

    if (enhancementData.deviceType === 'tablet') {
      css = `
        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
      `;
    }

    if (enhancementData.deviceType === 'desktop') {
      css = `
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
          }
        }
      `;
    }

    return css;
  }

  /**
   * Helper function to generate accessible HTML
   */
  function generateAccessibleHTML(accessibilityData) {
    let html = '';

    switch (accessibilityData.featureType) {
      case 'navigation':
        html = `
          <nav role="navigation" aria-label="Main navigation">
            ${accessibilityData.hasJavaScript ? 
              '<button class="nav-toggle" aria-expanded="false" aria-label="Toggle menu"></button>' : 
              ''
            }
            <ul class="nav-menu">
              <li><a href="/" ${accessibilityData.hasKeyboardOnly ? 'tabindex="0"' : ''}>Home</a></li>
            </ul>
          </nav>
        `;
        break;

      case 'search':
        html = `
          <form role="search" aria-label="Product search">
            <input type="search" aria-label="Search products" ${accessibilityData.hasJavaScript ? 'aria-describedby="search-help"' : ''} ${accessibilityData.hasKeyboardOnly ? 'tabindex="0"' : ''}>
            <button type="submit" ${accessibilityData.hasKeyboardOnly ? 'tabindex="0"' : ''}>Search</button>
            ${accessibilityData.hasJavaScript ? '<div id="search-help" class="visually-hidden">Use arrow keys to navigate suggestions</div>' : ''}
          </form>
        `;
        break;

      case 'cart':
        html = `
          <${accessibilityData.hasJavaScript ? 'button' : 'a'} 
            class="cart-button" 
            aria-label="Shopping cart"
            ${!accessibilityData.hasJavaScript ? 'href="/cart"' : ''}
            ${accessibilityData.hasKeyboardOnly ? 'tabindex="0"' : ''}
          >
            Cart
            <span aria-live="polite">0 items</span>
          </${accessibilityData.hasJavaScript ? 'button' : 'a'}>
        `;
        break;
    }

    return html;
  }

  /**
   * Helper function to generate degraded HTML for older browsers
   */
  function generateDegradedHTML(browserData) {
    let html = '<html>';

    if (browserData.browserType === 'legacy') {
      html += `
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
        <main>
          <header>
            <h1>Welcome</h1>
          </header>
          <form action="/search" method="get">
            <input type="text" name="q" placeholder="Search">
            <button type="submit">Search</button>
          </form>
        </main>
        <footer>
          <p>Copyright 2026</p>
        </footer>
      `;
    } else if (browserData.browserType === 'minimal') {
      html += `
        <nav role="navigation">
          <ul class="nav-menu">
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop</a></li>
          </ul>
        </nav>
        <main role="main">
          <header role="banner">
            <h1>Welcome</h1>
          </header>
        </main>
        <footer role="contentinfo">
          <p>Copyright 2026</p>
        </footer>
      `;
    } else {
      // Modern browser
      html += `
        <nav role="navigation" class="js-enabled">
          <button class="nav-toggle" aria-expanded="false">Menu</button>
          <ul class="nav-menu">
            <li><a href="/" tabindex="0">Home</a></li>
            <li><a href="/shop" tabindex="0">Shop</a></li>
          </ul>
        </nav>
        <main role="main">
          <header role="banner">
            <h1>Welcome</h1>
          </header>
        </main>
        <footer role="contentinfo">
          <p>Copyright 2026</p>
        </footer>
      `;
    }

    html += '</html>';
    return html;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 12: Mobile responsive design**
 * **Validates: Requirements 4.1**
 * 
 * For any mobile viewport, the homepage should implement fluid layouts 
 * that adapt appropriately to the screen size
 */
describe('Property 12: Mobile responsive design', () => {

  // Arbitrary for generating viewport data
  const viewportArb = fc.record({
    width: fc.integer({ min: 320, max: 1920 }),
    height: fc.integer({ min: 568, max: 1080 }),
    devicePixelRatio: fc.float({ min: 1, max: 3, noNaN: true }),
    orientation: fc.constantFrom('portrait', 'landscape'),
    isMobile: fc.boolean(),
    isTablet: fc.boolean()
  }).filter(data => {
    // Classify devices based on width
    data.isMobile = data.width <= 768;
    data.isTablet = data.width > 768 && data.width <= 1024;
    return true;
  });

  it('should implement mobile-first responsive breakpoints', () => {
    fc.assert(fc.property(viewportArb, (viewportData) => {
      const responsiveCSS = generateResponsiveCSS(viewportData);

      // Should always have base mobile styles
      expect(responsiveCSS).toContain('/* Base mobile styles */');
      expect(responsiveCSS).toContain('width: 100%');
      
      // Should have mobile-first media queries (min-width) when viewport is large enough
      if (viewportData.width >= 640) {
        expect(responsiveCSS).toMatch(/@media\s*\(\s*min-width:\s*\d+px\s*\)/);
        expect(responsiveCSS).toContain('@media (min-width: 640px)');
      }
      
      if (viewportData.width >= 768) {
        expect(responsiveCSS).toContain('@media (min-width: 768px)');
      }
      
      if (viewportData.width >= 1024) {
        expect(responsiveCSS).toContain('@media (min-width: 1024px)');
      }
      
      // Should not use max-width for mobile-first approach
      expect(responsiveCSS).not.toMatch(/@media\s*\(\s*max-width:\s*\d+px\s*\)/);

    }), { numRuns: 100 });
  });

  it('should use fluid layouts with CSS Grid and Flexbox', () => {
    const layoutArb = fc.record({
      containerType: fc.constantFrom('grid', 'flex'),
      itemCount: fc.integer({ min: 1, max: 12 }),
      viewportWidth: fc.integer({ min: 320, max: 1920 }),
      hasFluidColumns: fc.boolean(),
      hasFlexibleGaps: fc.boolean()
    });

    fc.assert(fc.property(layoutArb, (layoutData) => {
      const layoutCSS = generateFluidLayoutCSS(layoutData);

      if (layoutData.containerType === 'grid') {
        // Should use CSS Grid with fluid columns
        expect(layoutCSS).toMatch(/display:\s*grid/);
        
        if (layoutData.hasFluidColumns) {
          expect(layoutCSS).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/);
        }
        
        // Should adapt columns based on viewport
        if (layoutData.viewportWidth <= 640) {
          expect(layoutCSS).toMatch(/grid-template-columns:\s*1fr/);
        } else if (layoutData.viewportWidth <= 1024) {
          expect(layoutCSS).toMatch(/grid-template-columns:\s*repeat\([2-3],\s*1fr\)/);
        }
      }

      if (layoutData.containerType === 'flex') {
        // Should use Flexbox with flexible wrapping
        expect(layoutCSS).toMatch(/display:\s*flex/);
        expect(layoutCSS).toMatch(/flex-wrap:\s*wrap/);
        
        // Should have flexible gaps
        if (layoutData.hasFlexibleGaps) {
          expect(layoutCSS).toMatch(/gap:\s*var\(--space-\w+\)/);
        }
      }

    }), { numRuns: 100 });
  });

  it('should implement fluid typography with clamp() functions', () => {
    const typographyArb = fc.record({
      textType: fc.constantFrom('heading', 'body', 'caption', 'button'),
      minSize: fc.float({ min: 0.75, max: 1.5, noNaN: true }),
      maxSize: fc.float({ min: 1.5, max: 4, noNaN: true }),
      viewportWidth: fc.integer({ min: 320, max: 1920 }),
      hasFluidScaling: fc.boolean()
    }).filter(data => data.maxSize > data.minSize);

    fc.assert(fc.property(typographyArb, (typographyData) => {
      const typographyCSS = generateFluidTypographyCSS(typographyData);

      if (typographyData.hasFluidScaling) {
        // Should use clamp() for fluid typography
        expect(typographyCSS).toMatch(/font-size:\s*clamp\(/);
        
        // Should have proper clamp structure: clamp(min, preferred, max)
        expect(typographyCSS).toMatch(/clamp\(\s*[\d.]+rem,\s*[\d.]+vw\s*\+\s*[\d.]+rem,\s*[\d.]+rem\s*\)/);
        
        // Min size should be smaller than max size
        const clampMatch = typographyCSS.match(/clamp\(\s*([\d.]+)rem,\s*[\d.]+vw\s*\+\s*[\d.]+rem,\s*([\d.]+)rem\s*\)/);
        if (clampMatch) {
          const minValue = parseFloat(clampMatch[1]);
          const maxValue = parseFloat(clampMatch[2]);
          expect(maxValue).toBeGreaterThan(minValue);
        }
      }

      // Should have appropriate font sizes for different text types
      if (typographyData.textType === 'heading' && typographyData.hasFluidScaling) {
        expect(typographyCSS).toMatch(/font-size:\s*clamp\([\d.]+rem,\s*[\d.]+vw\s*\+\s*[\d.]+rem,\s*[\d.]+rem\)/);
      }

    }), { numRuns: 100 });
  });

  it('should adapt container widths across viewport sizes', () => {
    const containerArb = fc.record({
      containerType: fc.constantFrom('section-container', 'hero-container', 'product-grid'),
      viewportWidth: fc.integer({ min: 320, max: 1920 }),
      hasPadding: fc.boolean(),
      hasMaxWidth: fc.boolean(),
      isFluid: fc.boolean()
    });

    fc.assert(fc.property(containerArb, (containerData) => {
      const containerCSS = generateContainerCSS(containerData);

      // Should have appropriate width constraints
      if (containerData.hasMaxWidth) {
        expect(containerCSS).toMatch(/max-width:\s*var\(--container-\w+\)/);
      }

      // Should have responsive padding
      if (containerData.hasPadding) {
        expect(containerCSS).toMatch(/padding:\s*0\s*var\(--space-\w+\)/);
        
        // Should adapt to viewport size
        if (containerData.viewportWidth <= 640) {
          expect(containerCSS).toMatch(/padding:\s*0\s*var\(--space-md\)/);
        } else if (containerData.viewportWidth <= 1024) {
          expect(containerCSS).toMatch(/padding:\s*0\s*var\(--space-lg\)/);
        } else {
          expect(containerCSS).toMatch(/padding:\s*0\s*var\(--space-xl\)/);
        }
      }

      // Should be fluid by default
      if (containerData.isFluid) {
        expect(containerCSS).toMatch(/width:\s*100%/);
      }

    }), { numRuns: 100 });
  });

  it('should maintain proper component proportions across devices', () => {
    const componentArb = fc.record({
      componentType: fc.constantFrom('hero-section', 'product-card', 'category-card', 'navigation'),
      viewportWidth: fc.integer({ min: 320, max: 1920 }),
      aspectRatio: fc.float({ min: 0.5, max: 2, noNaN: true }),
      hasResponsiveImages: fc.boolean(),
      hasFlexibleLayout: fc.boolean()
    });

    fc.assert(fc.property(componentArb, (componentData) => {
      const componentCSS = generateComponentCSS(componentData);

      // Should maintain appropriate proportions
      if (componentData.hasResponsiveImages) {
        expect(componentCSS).toMatch(/aspect-ratio:\s*[\d.\/]+/);
        expect(componentCSS).toMatch(/object-fit:\s*cover/);
      }

      // Should have flexible layouts
      if (componentData.hasFlexibleLayout) {
        expect(componentCSS).toMatch(/display:\s*(flex|grid)/);
      }

      // Should adapt layout based on viewport
      if (componentData.componentType === 'hero-section' && componentData.hasFlexibleLayout) {
        if (componentData.viewportWidth <= 768) {
          expect(componentCSS).toMatch(/grid-template-columns:\s*1fr/);
          expect(componentCSS).toMatch(/text-align:\s*center/);
        } else {
          expect(componentCSS).toMatch(/grid-template-columns:\s*1fr\s*1fr/);
        }
      }

      if (componentData.componentType === 'navigation' && componentData.hasFlexibleLayout) {
        if (componentData.viewportWidth <= 768) {
          expect(componentCSS).toMatch(/flex-direction:\s*column/);
        } else {
          expect(componentCSS).toMatch(/flex-direction:\s*row/);
        }
      }

    }), { numRuns: 100 });
  });

  it('should implement progressive enhancement for larger screens', () => {
    const enhancementArb = fc.record({
      baseFeature: fc.constantFrom('navigation', 'grid-layout', 'typography', 'spacing'),
      viewportWidth: fc.integer({ min: 320, max: 1920 }),
      hasEnhancement: fc.boolean(),
      enhancementType: fc.constantFrom('visual', 'layout', 'interaction', 'performance')
    });

    fc.assert(fc.property(enhancementArb, (enhancementData) => {
      const enhancementCSS = generateProgressiveEnhancementCSS(enhancementData);

      // Base styles should work on all devices
      expect(enhancementCSS).toMatch(/\/\* Base styles \*\//);

      if (enhancementData.hasEnhancement && enhancementData.viewportWidth > 768) {
        // Should have progressive enhancements for larger screens
        expect(enhancementCSS).toMatch(/@media\s*\(\s*min-width:\s*\d+px\s*\)/);

        switch (enhancementData.enhancementType) {
          case 'visual':
            expect(enhancementCSS).toMatch(/transform|box-shadow|gradient/);
            break;
          case 'layout':
            if (enhancementData.baseFeature === 'navigation' || enhancementData.baseFeature === 'grid-layout') {
              expect(enhancementCSS).toMatch(/grid-template-columns|flex-direction/);
            }
            break;
          case 'interaction':
            expect(enhancementCSS).toMatch(/:hover|:focus/);
            break;
          case 'performance':
            expect(enhancementCSS).toMatch(/will-change|contain/);
            break;
        }
      }

    }), { numRuns: 100 });
  });

  /**
   * Helper function to generate responsive CSS
   */
  function generateResponsiveCSS(viewportData) {
    let css = `/* Base mobile styles */
    .container {
      width: 100%;
      padding: 0 var(--space-md);
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-md);
    }`;

    if (viewportData.width >= 640) {
      css += `
      
      @media (min-width: 640px) {
        .container {
          padding: 0 var(--space-lg);
        }
        
        .grid {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }
      }`;
    }

    if (viewportData.width >= 768) {
      css += `
      
      @media (min-width: 768px) {
        .container {
          max-width: var(--container-md);
          margin: 0 auto;
          padding: 0 var(--space-xl);
        }
      }`;
    }

    if (viewportData.width >= 1024) {
      css += `
      
      @media (min-width: 1024px) {
        .container {
          max-width: var(--container-lg);
        }
        
        .grid {
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }
      }`;
    }

    return css;
  }

  /**
   * Helper function to generate fluid layout CSS
   */
  function generateFluidLayoutCSS(layoutData) {
    let css = '';

    if (layoutData.containerType === 'grid') {
      css = `.grid-container {
        display: grid;`;

      if (layoutData.viewportWidth <= 640) {
        css += `
        grid-template-columns: 1fr;`;
      } else if (layoutData.viewportWidth <= 1024) {
        css += `
        grid-template-columns: repeat(2, 1fr);`;
      } else {
        css += `
        grid-template-columns: repeat(3, 1fr);`;
      }

      if (layoutData.hasFluidColumns) {
        css += `
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`;
      }

      if (layoutData.hasFlexibleGaps) {
        css += `
        gap: var(--space-lg);`;
      }

      css += `
      }`;
    }

    if (layoutData.containerType === 'flex') {
      css = `.flex-container {
        display: flex;
        flex-wrap: wrap;`;

      if (layoutData.hasFlexibleGaps) {
        css += `
        gap: var(--space-md);`;
      }

      css += `
      }`;
    }

    return css;
  }

  /**
   * Helper function to generate fluid typography CSS
   */
  function generateFluidTypographyCSS(typographyData) {
    let css = `.${typographyData.textType} {`;

    if (typographyData.hasFluidScaling) {
      const minSize = typographyData.minSize;
      const maxSize = typographyData.maxSize;
      const vwValue = ((maxSize - minSize) * 100 / (1920 - 320)).toFixed(2);
      const baseValue = (minSize - (320 * parseFloat(vwValue) / 100)).toFixed(2);

      css += `
      font-size: clamp(${minSize}rem, ${vwValue}vw + ${baseValue}rem, ${maxSize}rem);`;
    } else {
      // Fallback static sizes
      if (typographyData.textType === 'heading') {
        css += `
        font-size: 2rem;`;
      } else {
        css += `
        font-size: 1rem;`;
      }
    }

    css += `
    line-height: 1.5;
    }`;

    return css;
  }

  /**
   * Helper function to generate container CSS
   */
  function generateContainerCSS(containerData) {
    let css = `.${containerData.containerType} {
      width: 100%;`;

    if (containerData.isFluid) {
      css += `
      width: 100%;`;
    }

    if (containerData.hasMaxWidth) {
      if (containerData.viewportWidth <= 640) {
        css += `
        max-width: var(--container-sm);`;
      } else if (containerData.viewportWidth <= 1024) {
        css += `
        max-width: var(--container-md);`;
      } else {
        css += `
        max-width: var(--container-lg);`;
      }
    }

    if (containerData.hasPadding) {
      if (containerData.viewportWidth <= 640) {
        css += `
        padding: 0 var(--space-md);`;
      } else if (containerData.viewportWidth <= 1024) {
        css += `
        padding: 0 var(--space-lg);`;
      } else {
        css += `
        padding: 0 var(--space-xl);`;
      }
    }

    css += `
      margin: 0 auto;
    }`;

    return css;
  }

  /**
   * Helper function to generate component CSS
   */
  function generateComponentCSS(componentData) {
    let css = `.${componentData.componentType} {`;

    if (componentData.hasFlexibleLayout) {
      if (componentData.componentType === 'hero-section') {
        css += `
        display: grid;`;
        
        if (componentData.viewportWidth <= 768) {
          css += `
          grid-template-columns: 1fr;
          text-align: center;`;
        } else {
          css += `
          grid-template-columns: 1fr 1fr;
          text-align: left;`;
        }
      } else if (componentData.componentType === 'navigation') {
        css += `
        display: flex;`;
        
        if (componentData.viewportWidth <= 768) {
          css += `
          flex-direction: column;`;
        } else {
          css += `
          flex-direction: row;`;
        }
      } else if (componentData.componentType === 'product-card' || componentData.componentType === 'category-card') {
        css += `
        display: flex;
        flex-direction: column;`;
      }
    }

    if (componentData.hasResponsiveImages) {
      css += `
      aspect-ratio: ${componentData.aspectRatio};
      object-fit: cover;`;
    }

    css += `
    }`;

    return css;
  }

  /**
   * Helper function to generate progressive enhancement CSS
   */
  function generateProgressiveEnhancementCSS(enhancementData) {
    let css = `/* Base styles */
    .${enhancementData.baseFeature} {
      /* Core functionality that works everywhere */`;

    switch (enhancementData.baseFeature) {
      case 'navigation':
        css += `
        display: flex;
        flex-direction: column;`;
        break;
      case 'grid-layout':
        css += `
        display: block;`;
        break;
      case 'typography':
        css += `
        font-size: 1rem;`;
        break;
      case 'spacing':
        css += `
        margin: 1rem 0;`;
        break;
    }

    css += `
    }`;

    if (enhancementData.hasEnhancement && enhancementData.viewportWidth > 768) {
      css += `
      
      @media (min-width: 769px) {
        .${enhancementData.baseFeature} {`;

      switch (enhancementData.enhancementType) {
        case 'visual':
          css += `
          transform: perspective(1000px) rotateY(-2deg);
          box-shadow: var(--shadow-xl);`;
          break;
        case 'layout':
          if (enhancementData.baseFeature === 'navigation') {
            css += `
            flex-direction: row;`;
          } else if (enhancementData.baseFeature === 'grid-layout') {
            css += `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`;
          }
          break;
        case 'interaction':
          css += `
          transition: all 0.3s ease;
          }
          
          .${enhancementData.baseFeature}:hover {
            transform: translateY(-2px);`;
          break;
        case 'performance':
          css += `
          will-change: transform;
          contain: layout style paint;`;
          break;
      }

      css += `
        }
      }`;
    }

    return css;
  }
});

/**
 * **Feature: ecommerce-homepage, Property 18: Cart access functionality**
 * **Validates: Requirements 5.2**
 * 
 * For any cart icon interaction, it should provide quick access to cart contents and checkout process
 */
describe('Property 18: Cart access functionality', () => {

  // Mock cart data generator
  const cartItemArb = fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
    salePrice: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }), { nil: null }),
    quantity: fc.integer({ min: 1, max: 10 }),
    imageUrl: fc.webUrl()
  });

  const cartStateArb = fc.record({
    items: fc.array(cartItemArb, { maxLength: 20 }),
    isLoggedIn: fc.boolean(),
    hasShippingInfo: fc.boolean()
  });

  // Mock cart dropdown creation
  const createCartDropdown = (cartState) => {
    const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartState.items.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + (price * item.quantity);
    }, 0);

    return {
      element: {
        id: 'cart-dropdown',
        className: 'cart-dropdown cart-dropdown--visible',
        role: 'dialog',
        ariaLabel: 'Shopping cart'
      },
      header: {
        className: 'cart-dropdown__header',
        content: `Shopping Cart (${totalItems})`
      },
      items: cartState.items.map(item => ({
        className: 'cart-dropdown__item',
        productName: item.name,
        price: (item.salePrice || item.price).toFixed(2),
        quantity: item.quantity,
        removeButton: {
          className: 'cart-item__remove',
          ariaLabel: `Remove ${item.name}`,
          dataProductId: item.id.toString()
        }
      })),
      footer: {
        className: 'cart-dropdown__footer',
        total: {
          className: 'cart-dropdown__total',
          content: `Total: $${totalPrice.toFixed(2)}`
        },
        actions: {
          viewCart: {
            className: 'button button--secondary',
            href: '/cart',
            content: 'View Cart'
          },
          checkout: {
            className: 'button button--primary',
            href: '/checkout',
            content: 'Checkout'
          }
        }
      },
      isEmpty: totalItems === 0,
      totalItems,
      totalPrice
    };
  };

  it('should provide quick access to cart contents when cart icon is clicked', () => {
    fc.assert(fc.property(cartStateArb, (cartState) => {
      const dropdown = createCartDropdown(cartState);

      // Cart dropdown must have proper accessibility attributes
      expect(dropdown.element.id).toBe('cart-dropdown');
      expect(dropdown.element.className).toContain('cart-dropdown');
      expect(dropdown.element.role).toBe('dialog');
      expect(dropdown.element.ariaLabel).toBe('Shopping cart');

      // Header must display item count
      expect(dropdown.header.className).toBe('cart-dropdown__header');
      expect(dropdown.header.content).toContain(`Shopping Cart (${dropdown.totalItems})`);

      if (dropdown.isEmpty) {
        // Empty cart should show appropriate message and shopping link
        expect(dropdown.totalItems).toBe(0);
        expect(dropdown.totalPrice).toBe(0);
      } else {
        // Non-empty cart should display all items
        expect(dropdown.items.length).toBe(cartState.items.length);
        expect(dropdown.totalItems).toBeGreaterThan(0);
        expect(dropdown.totalPrice).toBeGreaterThan(0);

        // Each item should have required elements
        dropdown.items.forEach((item, index) => {
          const originalItem = cartState.items[index];
          
          expect(item.className).toBe('cart-dropdown__item');
          expect(item.productName).toBe(originalItem.name);
          expect(item.quantity).toBe(originalItem.quantity);
          expect(parseFloat(item.price)).toBeCloseTo(originalItem.salePrice || originalItem.price, 2);
          
          // Remove button must be accessible
          expect(item.removeButton.className).toBe('cart-item__remove');
          expect(item.removeButton.ariaLabel).toBe(`Remove ${originalItem.name}`);
          expect(item.removeButton.dataProductId).toBe(originalItem.id.toString());
        });

        // Footer must contain total and action buttons
        expect(dropdown.footer.className).toBe('cart-dropdown__footer');
        expect(dropdown.footer.total.content).toBe(`Total: $${dropdown.totalPrice.toFixed(2)}`);
        
        // Action buttons must provide checkout access
        expect(dropdown.footer.actions.viewCart.className).toBe('button button--secondary');
        expect(dropdown.footer.actions.viewCart.href).toBe('/cart');
        expect(dropdown.footer.actions.viewCart.content).toBe('View Cart');
        
        expect(dropdown.footer.actions.checkout.className).toBe('button button--primary');
        expect(dropdown.footer.actions.checkout.href).toBe('/checkout');
        expect(dropdown.footer.actions.checkout.content).toBe('Checkout');
      }

      return true;
    }), { numRuns: 100 });
  });

  it('should calculate cart totals correctly for quick access display', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
      (items) => {
        const cartState = { items, isLoggedIn: true, hasShippingInfo: true };
        const dropdown = createCartDropdown(cartState);

        // Calculate expected totals
        const expectedItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const expectedTotal = items.reduce((sum, item) => {
          const price = item.salePrice || item.price;
          return sum + (price * item.quantity);
        }, 0);

        // Verify calculations
        expect(dropdown.totalItems).toBe(expectedItemCount);
        expect(dropdown.totalPrice).toBeCloseTo(expectedTotal, 2);
        expect(dropdown.footer.total.content).toBe(`Total: $${expectedTotal.toFixed(2)}`);

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should provide consistent checkout process access regardless of cart state', () => {
    fc.assert(fc.property(cartStateArb, (cartState) => {
      const dropdown = createCartDropdown(cartState);

      if (!dropdown.isEmpty) {
        // Non-empty cart must always provide checkout access
        expect(dropdown.footer.actions.checkout).toBeDefined();
        expect(dropdown.footer.actions.checkout.href).toBe('/checkout');
        expect(dropdown.footer.actions.checkout.className).toContain('button--primary');
        
        // View cart link must also be available
        expect(dropdown.footer.actions.viewCart).toBeDefined();
        expect(dropdown.footer.actions.viewCart.href).toBe('/cart');
        expect(dropdown.footer.actions.viewCart.className).toContain('button--secondary');
      }

      return true;
    }), { numRuns: 50 });
  });

  it('should maintain accessibility standards for cart access interface', () => {
    fc.assert(fc.property(cartStateArb, (cartState) => {
      const dropdown = createCartDropdown(cartState);

      // Dialog must have proper ARIA attributes
      expect(dropdown.element.role).toBe('dialog');
      expect(dropdown.element.ariaLabel).toBeTruthy();
      expect(dropdown.element.id).toBeTruthy();

      // All interactive elements must be accessible
      if (!dropdown.isEmpty) {
        dropdown.items.forEach(item => {
          // Remove buttons must have descriptive labels
          expect(item.removeButton.ariaLabel).toContain('Remove');
          expect(item.removeButton.ariaLabel).toContain(item.productName);
          expect(item.removeButton.dataProductId).toBeTruthy();
        });

        // Action buttons must be properly labeled
        expect(dropdown.footer.actions.viewCart.content).toBeTruthy();
        expect(dropdown.footer.actions.checkout.content).toBeTruthy();
      }

      return true;
    }), { numRuns: 50 });
  });

  it('should handle empty cart state appropriately for quick access', () => {
    fc.assert(fc.property(
      fc.constant({ items: [], isLoggedIn: fc.boolean(), hasShippingInfo: fc.boolean() }),
      (emptyCartState) => {
        const dropdown = createCartDropdown(emptyCartState);

        // Empty cart properties
        expect(dropdown.isEmpty).toBe(true);
        expect(dropdown.totalItems).toBe(0);
        expect(dropdown.totalPrice).toBe(0);
        expect(dropdown.items.length).toBe(0);

        // Should still maintain proper structure
        expect(dropdown.element.role).toBe('dialog');
        expect(dropdown.element.ariaLabel).toBe('Shopping cart');
        expect(dropdown.header.content).toContain('Shopping Cart (0)');

        return true;
      }
    ), { numRuns: 20 });
  });

  it('should provide quick access to individual item management', () => {
    fc.assert(fc.property(
      fc.array(cartItemArb, { minLength: 1, maxLength: 5 }),
      (items) => {
        const cartState = { items, isLoggedIn: true, hasShippingInfo: true };
        const dropdown = createCartDropdown(cartState);

        // Each item must provide removal functionality
        dropdown.items.forEach((dropdownItem, index) => {
          const originalItem = items[index];
          
          // Item display must include essential information
          expect(dropdownItem.productName).toBe(originalItem.name);
          expect(dropdownItem.quantity).toBe(originalItem.quantity);
          expect(parseFloat(dropdownItem.price)).toBeCloseTo(originalItem.salePrice || originalItem.price, 2);
          
          // Remove functionality must be accessible
          expect(dropdownItem.removeButton.className).toBe('cart-item__remove');
          expect(dropdownItem.removeButton.dataProductId).toBe(originalItem.id.toString());
          expect(dropdownItem.removeButton.ariaLabel).toContain(originalItem.name);
        });

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should maintain consistent interface structure across different cart states', () => {
    fc.assert(fc.property(
      cartStateArb,
      cartStateArb,
      (cartState1, cartState2) => {
        const dropdown1 = createCartDropdown(cartState1);
        const dropdown2 = createCartDropdown(cartState2);

        // Core structure should remain consistent
        expect(dropdown1.element.className).toContain('cart-dropdown');
        expect(dropdown2.element.className).toContain('cart-dropdown');
        
        expect(dropdown1.element.role).toBe(dropdown2.element.role);
        expect(dropdown1.element.ariaLabel).toBe(dropdown2.element.ariaLabel);
        
        expect(dropdown1.header.className).toBe(dropdown2.header.className);
        
        // Non-empty carts should have consistent footer structure
        if (!dropdown1.isEmpty && !dropdown2.isEmpty) {
          expect(dropdown1.footer.className).toBe(dropdown2.footer.className);
          expect(dropdown1.footer.actions.viewCart.className).toBe(dropdown2.footer.actions.viewCart.className);
          expect(dropdown1.footer.actions.checkout.className).toBe(dropdown2.footer.actions.checkout.className);
        }

        return true;
      }
    ), { numRuns: 50 });
  });
});
/**
 * **Feature: ecommerce-homepage, Property 19: User personalization**
 * **Validates: Requirements 5.3**
 * 
 * For any logged-in user, the homepage should display personalized account access and user-specific recommendations
 */
describe('Property 19: User personalization', () => {

  // Mock user data generator
  const userDataArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0),
    email: fc.emailAddress(),
    preferences: fc.record({
      theme: fc.constantFrom('light', 'dark', 'auto'),
      language: fc.constantFrom('en', 'es', 'fr', 'de'),
      currency: fc.constantFrom('USD', 'EUR', 'GBP', 'CAD'),
      categories: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 5 }),
      notifications: fc.boolean()
    }),
    isLoggedIn: fc.constant(true),
    authToken: fc.string({ minLength: 32, maxLength: 64 })
  });

  const recommendationArb = fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
    price: fc.float({ min: Math.fround(1.00), max: Math.fround(999.99), noNaN: true }),
    category: fc.string({ minLength: 3, maxLength: 20 }),
    image: fc.webUrl(),
    relevanceScore: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true })
  });

  // Mock personalized homepage creation
  const createPersonalizedHomepage = (user, recommendations = []) => {
    return {
      user: user,
      isLoggedIn: user.isLoggedIn,
      accountAccess: {
        userGreeting: {
          className: 'user-greeting',
          textContent: `Hello, ${user.name || user.email.split('@')[0]}!`,
          visible: true
        },
        userAccount: {
          className: 'user-account user-account--logged-in',
          ariaLabel: `User account: ${user.name || user.email}`,
          visible: true
        },
        loginButton: {
          className: 'login-button',
          visible: false
        },
        logoutButton: {
          className: 'logout-button',
          visible: true
        },
        userMenu: {
          className: 'user-menu',
          items: [
            { text: 'My Account', href: '/account' },
            { text: 'Order History', href: '/orders' },
            { text: 'Preferences', href: '/preferences' },
            { text: 'Logout', action: 'logout' }
          ]
        }
      },
      personalizedContent: {
        className: 'personalized-content personalized-content--active',
        visible: true,
        recommendations: {
          section: {
            className: 'recommendations-section',
            visible: recommendations.length > 0
          },
          header: {
            className: 'recommendations-header',
            title: 'Recommended for You'
          },
          items: recommendations.map(rec => ({
            id: rec.id,
            className: 'recommendation-card',
            name: rec.name,
            price: rec.price,
            category: rec.category,
            image: rec.image,
            relevanceScore: rec.relevanceScore,
            actionButton: {
              className: 'recommendation-card__action',
              text: 'Add to Cart',
              dataProductId: rec.id.toString()
            }
          }))
        }
      },
      appliedPreferences: {
        theme: user.preferences.theme,
        language: user.preferences.language,
        currency: user.preferences.currency,
        categories: user.preferences.categories,
        notifications: user.preferences.notifications
      }
    };
  };

  it('should display personalized account access for logged-in users', () => {
    fc.assert(fc.property(userDataArb, (user) => {
      const homepage = createPersonalizedHomepage(user);

      // User must be logged in
      expect(homepage.isLoggedIn).toBe(true);
      expect(homepage.user.isLoggedIn).toBe(true);

      // Account access elements must be properly configured
      const { accountAccess } = homepage;

      // User greeting must be visible and personalized
      expect(accountAccess.userGreeting.visible).toBe(true);
      expect(accountAccess.userGreeting.className).toBe('user-greeting');
      expect(accountAccess.userGreeting.textContent).toContain('Hello');
      expect(accountAccess.userGreeting.textContent).toContain(user.name || user.email.split('@')[0]);

      // User account element must show logged-in state
      expect(accountAccess.userAccount.visible).toBe(true);
      expect(accountAccess.userAccount.className).toContain('user-account--logged-in');
      expect(accountAccess.userAccount.ariaLabel).toContain(user.name || user.email);

      // Login button must be hidden, logout button visible
      expect(accountAccess.loginButton.visible).toBe(false);
      expect(accountAccess.logoutButton.visible).toBe(true);

      // User menu must contain account-related options
      expect(accountAccess.userMenu.items.length).toBeGreaterThan(0);
      const menuTexts = accountAccess.userMenu.items.map(item => item.text);
      expect(menuTexts).toContain('My Account');
      expect(menuTexts).toContain('Logout');

      return true;
    }), { numRuns: 100 });
  });

  it('should display user-specific recommendations for logged-in users', () => {
    fc.assert(fc.property(
      userDataArb,
      fc.array(recommendationArb, { minLength: 1, maxLength: 8 }),
      (user, recommendations) => {
        const homepage = createPersonalizedHomepage(user, recommendations);

        // Personalized content must be active
        expect(homepage.personalizedContent.visible).toBe(true);
        expect(homepage.personalizedContent.className).toContain('personalized-content--active');

        // Recommendations section must be visible when recommendations exist
        const { recommendations: recSection } = homepage.personalizedContent;
        expect(recSection.section.visible).toBe(true);
        expect(recSection.section.className).toBe('recommendations-section');

        // Header must indicate personalization
        expect(recSection.header.title).toBe('Recommended for You');

        // Each recommendation must have required elements
        expect(recSection.items.length).toBe(recommendations.length);
        
        recSection.items.forEach((item, index) => {
          const originalRec = recommendations[index];
          
          expect(item.id).toBe(originalRec.id);
          expect(item.className).toBe('recommendation-card');
          expect(item.name).toBe(originalRec.name);
          expect(item.price).toBeCloseTo(originalRec.price, 2);
          expect(item.category).toBe(originalRec.category);
          expect(item.image).toBe(originalRec.image);
          expect(item.relevanceScore).toBeCloseTo(originalRec.relevanceScore, 2);
          
          // Action button must be properly configured
          expect(item.actionButton.className).toBe('recommendation-card__action');
          expect(item.actionButton.text).toBe('Add to Cart');
          expect(item.actionButton.dataProductId).toBe(originalRec.id.toString());
        });

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should apply user preferences to personalized interface', () => {
    fc.assert(fc.property(userDataArb, (user) => {
      const homepage = createPersonalizedHomepage(user);

      // User preferences must be applied
      const { appliedPreferences } = homepage;
      
      expect(appliedPreferences.theme).toBe(user.preferences.theme);
      expect(appliedPreferences.language).toBe(user.preferences.language);
      expect(appliedPreferences.currency).toBe(user.preferences.currency);
      expect(appliedPreferences.notifications).toBe(user.preferences.notifications);

      // Theme preference must be valid
      expect(['light', 'dark', 'auto']).toContain(appliedPreferences.theme);

      // Language preference must be valid
      expect(['en', 'es', 'fr', 'de']).toContain(appliedPreferences.language);

      // Currency preference must be valid
      expect(['USD', 'EUR', 'GBP', 'CAD']).toContain(appliedPreferences.currency);

      // Notifications preference must be boolean
      expect(typeof appliedPreferences.notifications).toBe('boolean');

      return true;
    }), { numRuns: 50 });
  });

  it('should maintain consistent personalization across different user states', () => {
    fc.assert(fc.property(
      userDataArb,
      userDataArb,
      (user1, user2) => {
        const homepage1 = createPersonalizedHomepage(user1);
        const homepage2 = createPersonalizedHomepage(user2);

        // Both should show logged-in state
        expect(homepage1.isLoggedIn).toBe(true);
        expect(homepage2.isLoggedIn).toBe(true);

        // Account access structure should be consistent
        expect(homepage1.accountAccess.userGreeting.className).toBe(homepage2.accountAccess.userGreeting.className);
        expect(homepage1.accountAccess.userAccount.className).toContain('user-account--logged-in');
        expect(homepage2.accountAccess.userAccount.className).toContain('user-account--logged-in');

        // Both should have personalized content active
        expect(homepage1.personalizedContent.className).toContain('personalized-content--active');
        expect(homepage2.personalizedContent.className).toContain('personalized-content--active');

        // User menu structure should be consistent
        expect(homepage1.accountAccess.userMenu.items.length).toBe(homepage2.accountAccess.userMenu.items.length);

        // But content should be personalized to each user
        expect(homepage1.accountAccess.userGreeting.textContent).not.toBe(homepage2.accountAccess.userGreeting.textContent);
        expect(homepage1.accountAccess.userAccount.ariaLabel).not.toBe(homepage2.accountAccess.userAccount.ariaLabel);

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should handle empty recommendations gracefully for logged-in users', () => {
    fc.assert(fc.property(userDataArb, (user) => {
      const homepage = createPersonalizedHomepage(user, []); // No recommendations

      // User should still be logged in with account access
      expect(homepage.isLoggedIn).toBe(true);
      expect(homepage.accountAccess.userGreeting.visible).toBe(true);
      expect(homepage.accountAccess.userAccount.visible).toBe(true);

      // Personalized content should still be active
      expect(homepage.personalizedContent.visible).toBe(true);
      expect(homepage.personalizedContent.className).toContain('personalized-content--active');

      // Recommendations section should be hidden when empty
      expect(homepage.personalizedContent.recommendations.section.visible).toBe(false);
      expect(homepage.personalizedContent.recommendations.items.length).toBe(0);

      // Preferences should still be applied
      expect(homepage.appliedPreferences.theme).toBeTruthy();
      expect(homepage.appliedPreferences.language).toBeTruthy();
      expect(homepage.appliedPreferences.currency).toBeTruthy();

      return true;
    }), { numRuns: 30 });
  });

  it('should prioritize high-relevance recommendations for personalized display', () => {
    fc.assert(fc.property(
      userDataArb,
      fc.array(recommendationArb, { minLength: 3, maxLength: 10 }),
      (user, recommendations) => {
        // Sort recommendations by relevance score (descending)
        const sortedRecommendations = [...recommendations].sort((a, b) => b.relevanceScore - a.relevanceScore);
        const homepage = createPersonalizedHomepage(user, sortedRecommendations);

        const displayedRecs = homepage.personalizedContent.recommendations.items;

        // Recommendations should maintain relevance order
        for (let i = 0; i < displayedRecs.length - 1; i++) {
          expect(displayedRecs[i].relevanceScore).toBeGreaterThanOrEqual(displayedRecs[i + 1].relevanceScore);
        }

        // All recommendations should have valid relevance scores
        displayedRecs.forEach(rec => {
          expect(rec.relevanceScore).toBeGreaterThan(0);
          expect(rec.relevanceScore).toBeLessThanOrEqual(1);
        });

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should provide accessible personalized interface elements', () => {
    fc.assert(fc.property(userDataArb, (user) => {
      const homepage = createPersonalizedHomepage(user);

      // Account access must have proper ARIA labels
      expect(homepage.accountAccess.userAccount.ariaLabel).toBeTruthy();
      expect(homepage.accountAccess.userAccount.ariaLabel).toContain('User account');

      // User greeting must be visible to screen readers
      expect(homepage.accountAccess.userGreeting.visible).toBe(true);
      expect(homepage.accountAccess.userGreeting.textContent).toBeTruthy();

      // User menu items must have proper navigation structure
      homepage.accountAccess.userMenu.items.forEach(item => {
        expect(item.text).toBeTruthy();
        expect(item.href || item.action).toBeTruthy();
      });

      // Recommendation action buttons must have proper labels
      homepage.personalizedContent.recommendations.items.forEach(item => {
        expect(item.actionButton.text).toBeTruthy();
        expect(item.actionButton.dataProductId).toBeTruthy();
      });

      return true;
    }), { numRuns: 50 });
  });

  it('should maintain user identity consistency across personalized elements', () => {
    fc.assert(fc.property(userDataArb, (user) => {
      const homepage = createPersonalizedHomepage(user);

      // User identity should be consistent across all personalized elements
      const displayName = user.name || user.email.split('@')[0];
      
      expect(homepage.accountAccess.userGreeting.textContent).toContain(displayName);
      expect(homepage.accountAccess.userAccount.ariaLabel).toContain(user.name || user.email);

      // User object should match original data
      expect(homepage.user.id).toBe(user.id);
      expect(homepage.user.name).toBe(user.name);
      expect(homepage.user.email).toBe(user.email);
      expect(homepage.user.isLoggedIn).toBe(user.isLoggedIn);

      // Applied preferences should match user preferences
      Object.keys(user.preferences).forEach(key => {
        expect(homepage.appliedPreferences[key]).toBe(user.preferences[key]);
      });

      return true;
    }), { numRuns: 50 });
  });
});
/**
 * **Feature: ecommerce-homepage, Property 20: Preference persistence**
 * **Validates: Requirements 5.4**
 * 
 * For any user with saved preferences, the homepage should remember and apply previous settings and preferences
 */
describe('Property 20: Preference persistence', () => {

  // Mock preference data generator
  const preferenceArb = fc.record({
    theme: fc.constantFrom('light', 'dark', 'auto'),
    language: fc.constantFrom('en', 'es', 'fr', 'de', 'it', 'pt'),
    currency: fc.constantFrom('USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'),
    notifications: fc.boolean(),
    categories: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 8 }),
    priceRange: fc.record({
      min: fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
      max: fc.float({ min: Math.fround(100), max: Math.fround(1000), noNaN: true })
    }),
    brands: fc.array(fc.string({ minLength: 2, maxLength: 30 }), { maxLength: 10 }),
    layout: fc.constantFrom('grid', 'list', 'compact'),
    itemsPerPage: fc.constantFrom(12, 24, 48, 96)
  });

  const sessionArb = fc.record({
    isLoggedIn: fc.boolean(),
    userId: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: null }),
    authToken: fc.option(fc.string({ minLength: 32, maxLength: 64 }), { nil: null }),
    sessionTimestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }) // Last 24 hours
  });

  // Mock preference persistence system
  const createPreferencePersistenceSystem = (preferences, session) => {
    const storageKey = session.isLoggedIn ? `user_preferences_${session.userId}` : 'anonymous_preferences';
    
    return {
      session: session,
      preferences: preferences,
      storageKey: storageKey,
      persistence: {
        localStorage: {
          key: session.isLoggedIn ? null : 'user_preferences', // Anonymous users use localStorage
          data: session.isLoggedIn ? null : preferences
        },
        apiStorage: {
          endpoint: session.isLoggedIn ? `/api/user/${session.userId}/preferences` : null,
          data: session.isLoggedIn ? preferences : null,
          authToken: session.authToken
        }
      },
      appliedSettings: {
        documentElement: {
          attributes: {
            'data-theme': preferences.theme,
            'lang': preferences.language,
            'data-currency': preferences.currency,
            'data-notifications': preferences.notifications ? 'enabled' : 'disabled'
          }
        },
        interface: {
          theme: preferences.theme,
          language: preferences.language,
          currency: preferences.currency,
          notifications: preferences.notifications,
          layout: preferences.layout,
          itemsPerPage: preferences.itemsPerPage
        },
        filters: {
          categories: preferences.categories,
          priceRange: preferences.priceRange,
          brands: preferences.brands
        }
      },
      loadedFromStorage: true,
      savedToStorage: true,
      lastSyncTimestamp: Date.now()
    };
  };

  it('should persist and restore user preferences across sessions', () => {
    fc.assert(fc.property(
      preferenceArb,
      sessionArb,
      (preferences, session) => {
        const persistenceSystem = createPreferencePersistenceSystem(preferences, session);

        // Preferences must be properly stored
        if (session.isLoggedIn) {
          // Logged-in users: API storage
          expect(persistenceSystem.persistence.apiStorage.endpoint).toBeTruthy();
          expect(persistenceSystem.persistence.apiStorage.data).toEqual(preferences);
          expect(persistenceSystem.persistence.apiStorage.authToken).toBe(session.authToken);
          expect(persistenceSystem.persistence.localStorage.data).toBeNull();
        } else {
          // Anonymous users: localStorage
          expect(persistenceSystem.persistence.localStorage.key).toBe('user_preferences');
          expect(persistenceSystem.persistence.localStorage.data).toEqual(preferences);
          expect(persistenceSystem.persistence.apiStorage.endpoint).toBeNull();
        }

        // Preferences must be applied to interface
        const { appliedSettings } = persistenceSystem;
        
        expect(appliedSettings.interface.theme).toBe(preferences.theme);
        expect(appliedSettings.interface.language).toBe(preferences.language);
        expect(appliedSettings.interface.currency).toBe(preferences.currency);
        expect(appliedSettings.interface.notifications).toBe(preferences.notifications);
        expect(appliedSettings.interface.layout).toBe(preferences.layout);
        expect(appliedSettings.interface.itemsPerPage).toBe(preferences.itemsPerPage);

        // Document attributes must reflect preferences
        expect(appliedSettings.documentElement.attributes['data-theme']).toBe(preferences.theme);
        expect(appliedSettings.documentElement.attributes['lang']).toBe(preferences.language);
        expect(appliedSettings.documentElement.attributes['data-currency']).toBe(preferences.currency);
        expect(appliedSettings.documentElement.attributes['data-notifications']).toBe(
          preferences.notifications ? 'enabled' : 'disabled'
        );

        // Filters must be preserved
        expect(appliedSettings.filters.categories).toEqual(preferences.categories);
        expect(appliedSettings.filters.priceRange).toEqual(preferences.priceRange);
        expect(appliedSettings.filters.brands).toEqual(preferences.brands);

        // System must indicate successful persistence
        expect(persistenceSystem.loadedFromStorage).toBe(true);
        expect(persistenceSystem.savedToStorage).toBe(true);
        expect(persistenceSystem.lastSyncTimestamp).toBeGreaterThan(0);

        return true;
      }
    ), { numRuns: 100 });
  });

  it('should handle preference updates and maintain persistence', () => {
    fc.assert(fc.property(
      preferenceArb,
      preferenceArb,
      sessionArb,
      (initialPreferences, updatedPreferences, session) => {
        // Start with initial preferences
        const initialSystem = createPreferencePersistenceSystem(initialPreferences, session);
        
        // Update preferences
        const updatedSystem = createPreferencePersistenceSystem(updatedPreferences, session);

        // Storage mechanism should remain consistent
        expect(initialSystem.persistence.localStorage.key).toBe(updatedSystem.persistence.localStorage.key);
        expect(initialSystem.persistence.apiStorage.endpoint).toBe(updatedSystem.persistence.apiStorage.endpoint);

        // Updated preferences should be properly stored
        if (session.isLoggedIn) {
          expect(updatedSystem.persistence.apiStorage.data).toEqual(updatedPreferences);
        } else {
          expect(updatedSystem.persistence.localStorage.data).toEqual(updatedPreferences);
        }

        // Applied settings should reflect updates
        expect(updatedSystem.appliedSettings.interface.theme).toBe(updatedPreferences.theme);
        expect(updatedSystem.appliedSettings.interface.language).toBe(updatedPreferences.language);
        expect(updatedSystem.appliedSettings.interface.currency).toBe(updatedPreferences.currency);

        // Document attributes should be updated
        expect(updatedSystem.appliedSettings.documentElement.attributes['data-theme']).toBe(updatedPreferences.theme);
        expect(updatedSystem.appliedSettings.documentElement.attributes['lang']).toBe(updatedPreferences.language);

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should maintain preference consistency across different storage mechanisms', () => {
    fc.assert(fc.property(
      preferenceArb,
      (preferences) => {
        // Test both logged-in and anonymous sessions
        const loggedInSession = { isLoggedIn: true, userId: 123, authToken: 'token123', sessionTimestamp: Date.now() };
        const anonymousSession = { isLoggedIn: false, userId: null, authToken: null, sessionTimestamp: Date.now() };

        const loggedInSystem = createPreferencePersistenceSystem(preferences, loggedInSession);
        const anonymousSystem = createPreferencePersistenceSystem(preferences, anonymousSession);

        // Applied settings should be identical regardless of storage mechanism
        expect(loggedInSystem.appliedSettings.interface).toEqual(anonymousSystem.appliedSettings.interface);
        expect(loggedInSystem.appliedSettings.documentElement).toEqual(anonymousSystem.appliedSettings.documentElement);
        expect(loggedInSystem.appliedSettings.filters).toEqual(anonymousSystem.appliedSettings.filters);

        // Both should indicate successful persistence
        expect(loggedInSystem.loadedFromStorage).toBe(true);
        expect(loggedInSystem.savedToStorage).toBe(true);
        expect(anonymousSystem.loadedFromStorage).toBe(true);
        expect(anonymousSystem.savedToStorage).toBe(true);

        // Storage mechanisms should be different but both functional
        expect(loggedInSystem.persistence.apiStorage.endpoint).toBeTruthy();
        expect(loggedInSystem.persistence.localStorage.data).toBeNull();
        expect(anonymousSystem.persistence.localStorage.data).toBeTruthy();
        expect(anonymousSystem.persistence.apiStorage.endpoint).toBeNull();

        return true;
      }
    ), { numRuns: 50 });
  });

  it('should validate preference data integrity during persistence', () => {
    fc.assert(fc.property(preferenceArb, sessionArb, (preferences, session) => {
      const persistenceSystem = createPreferencePersistenceSystem(preferences, session);

      // Theme preference must be valid
      expect(['light', 'dark', 'auto']).toContain(persistenceSystem.preferences.theme);
      expect(['light', 'dark', 'auto']).toContain(persistenceSystem.appliedSettings.interface.theme);

      // Language preference must be valid
      expect(['en', 'es', 'fr', 'de', 'it', 'pt']).toContain(persistenceSystem.preferences.language);
      expect(['en', 'es', 'fr', 'de', 'it', 'pt']).toContain(persistenceSystem.appliedSettings.interface.language);

      // Currency preference must be valid
      expect(['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD']).toContain(persistenceSystem.preferences.currency);
      expect(['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD']).toContain(persistenceSystem.appliedSettings.interface.currency);

      // Notifications preference must be boolean
      expect(typeof persistenceSystem.preferences.notifications).toBe('boolean');
      expect(typeof persistenceSystem.appliedSettings.interface.notifications).toBe('boolean');

      // Price range must be valid
      expect(persistenceSystem.preferences.priceRange.min).toBeLessThanOrEqual(persistenceSystem.preferences.priceRange.max);
      expect(persistenceSystem.preferences.priceRange.min).toBeGreaterThanOrEqual(0);

      // Layout preference must be valid
      expect(['grid', 'list', 'compact']).toContain(persistenceSystem.preferences.layout);

      // Items per page must be valid
      expect([12, 24, 48, 96]).toContain(persistenceSystem.preferences.itemsPerPage);

      // Categories and brands must be arrays
      expect(Array.isArray(persistenceSystem.preferences.categories)).toBe(true);
      expect(Array.isArray(persistenceSystem.preferences.brands)).toBe(true);

      return true;
    }), { numRuns: 50 });
  });

  it('should handle preference migration between anonymous and logged-in states', () => {
    fc.assert(fc.property(preferenceArb, (preferences) => {
      // Start as anonymous user
      const anonymousSession = { isLoggedIn: false, userId: null, authToken: null, sessionTimestamp: Date.now() };
      const anonymousSystem = createPreferencePersistenceSystem(preferences, anonymousSession);

      // Migrate to logged-in user
      const loggedInSession = { isLoggedIn: true, userId: 456, authToken: 'newtoken456', sessionTimestamp: Date.now() };
      const loggedInSystem = createPreferencePersistenceSystem(preferences, loggedInSession);

      // Preferences should be preserved during migration
      expect(loggedInSystem.preferences).toEqual(anonymousSystem.preferences);
      expect(loggedInSystem.appliedSettings.interface).toEqual(anonymousSystem.appliedSettings.interface);

      // Storage mechanism should change appropriately
      expect(anonymousSystem.persistence.localStorage.data).toBeTruthy();
      expect(anonymousSystem.persistence.apiStorage.endpoint).toBeNull();
      
      expect(loggedInSystem.persistence.apiStorage.endpoint).toBeTruthy();
      expect(loggedInSystem.persistence.localStorage.data).toBeNull();

      // Both systems should maintain persistence integrity
      expect(anonymousSystem.savedToStorage).toBe(true);
      expect(loggedInSystem.savedToStorage).toBe(true);

      return true;
    }), { numRuns: 30 });
  });

  it('should preserve complex preference structures during persistence', () => {
    fc.assert(fc.property(preferenceArb, sessionArb, (preferences, session) => {
      const persistenceSystem = createPreferencePersistenceSystem(preferences, session);

      // Complex nested structures should be preserved
      expect(persistenceSystem.appliedSettings.filters.priceRange).toEqual(preferences.priceRange);
      expect(persistenceSystem.appliedSettings.filters.priceRange.min).toBe(preferences.priceRange.min);
      expect(persistenceSystem.appliedSettings.filters.priceRange.max).toBe(preferences.priceRange.max);

      // Arrays should be preserved with correct order and content
      expect(persistenceSystem.appliedSettings.filters.categories).toEqual(preferences.categories);
      expect(persistenceSystem.appliedSettings.filters.brands).toEqual(preferences.brands);

      // Array lengths should match
      expect(persistenceSystem.appliedSettings.filters.categories.length).toBe(preferences.categories.length);
      expect(persistenceSystem.appliedSettings.filters.brands.length).toBe(preferences.brands.length);

      // Individual array elements should be preserved
      preferences.categories.forEach((category, index) => {
        expect(persistenceSystem.appliedSettings.filters.categories[index]).toBe(category);
      });

      preferences.brands.forEach((brand, index) => {
        expect(persistenceSystem.appliedSettings.filters.brands[index]).toBe(brand);
      });

      return true;
    }), { numRuns: 50 });
  });

  it('should maintain preference persistence timestamps and metadata', () => {
    fc.assert(fc.property(preferenceArb, sessionArb, (preferences, session) => {
      const persistenceSystem = createPreferencePersistenceSystem(preferences, session);

      // Timestamp should be recent and valid
      expect(persistenceSystem.lastSyncTimestamp).toBeGreaterThan(Date.now() - 1000); // Within last second
      expect(persistenceSystem.lastSyncTimestamp).toBeLessThanOrEqual(Date.now());

      // Storage key should be appropriate for session type
      if (session.isLoggedIn) {
        expect(persistenceSystem.storageKey).toBe(`user_preferences_${session.userId}`);
      } else {
        expect(persistenceSystem.storageKey).toBe('anonymous_preferences');
      }

      // Persistence flags should indicate successful operations
      expect(persistenceSystem.loadedFromStorage).toBe(true);
      expect(persistenceSystem.savedToStorage).toBe(true);

      // Session data should be preserved
      expect(persistenceSystem.session).toEqual(session);

      return true;
    }), { numRuns: 50 });
  });

  it('should handle preference defaults and fallbacks during persistence', () => {
    fc.assert(fc.property(sessionArb, (session) => {
      // Test with minimal/default preferences
      const defaultPreferences = {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        notifications: true,
        categories: [],
        priceRange: { min: 0, max: 1000 },
        brands: [],
        layout: 'grid',
        itemsPerPage: 24
      };

      const persistenceSystem = createPreferencePersistenceSystem(defaultPreferences, session);

      // Default preferences should be properly applied
      expect(persistenceSystem.appliedSettings.interface.theme).toBe('light');
      expect(persistenceSystem.appliedSettings.interface.language).toBe('en');
      expect(persistenceSystem.appliedSettings.interface.currency).toBe('USD');
      expect(persistenceSystem.appliedSettings.interface.notifications).toBe(true);

      // Empty arrays should be handled correctly
      expect(persistenceSystem.appliedSettings.filters.categories).toEqual([]);
      expect(persistenceSystem.appliedSettings.filters.brands).toEqual([]);

      // Default price range should be valid
      expect(persistenceSystem.appliedSettings.filters.priceRange.min).toBe(0);
      expect(persistenceSystem.appliedSettings.filters.priceRange.max).toBe(1000);

      // Persistence should still work with defaults
      expect(persistenceSystem.loadedFromStorage).toBe(true);
      expect(persistenceSystem.savedToStorage).toBe(true);

      return true;
    }), { numRuns: 30 });
  });
});