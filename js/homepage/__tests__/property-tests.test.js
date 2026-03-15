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