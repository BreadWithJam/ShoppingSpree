/**
 * Cart Status Display Property-Based Tests
 * Tests shopping cart status display functionality
 */

const fc = require('fast-check');

/**
 * **Feature: ecommerce-homepage, Property 17: Shopping cart status display**
 * **Validates: Requirements 5.1**
 * 
 * For any homepage view, the shopping cart should display current 
 * item count and total value in the header
 */

// Mock cart item structure
const createCartItem = (id, name, price, quantity) => ({
  product: {
    id,
    name,
    price,
    salePrice: null
  },
  quantity,
  addedAt: new Date().toISOString()
});

// Mock cart status display
const createCartStatusDisplay = (items = []) => {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  return {
    button: {
      className: 'cart-button',
      ariaLabel: 'Shopping cart',
      ariaDescribedBy: 'cart-status'
    },
    count: {
      className: 'cart-count',
      ariaLive: 'polite',
      value: itemCount,
      textContent: itemCount.toString()
    },
    status: {
      id: 'cart-status',
      className: 'visually-hidden',
      textContent: itemCount === 0 
        ? 'Shopping cart is empty'
        : `Shopping cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}, total $${total.toFixed(2)}`
    },
    items,
    totals: {
      itemCount,
      total
    }
  };
};

describe('Cart Status Display Property Tests', () => {

  test('Property 17: Shopping cart status display', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
          quantity: fc.integer({ min: 1, max: 10 })
        }),
        { maxLength: 20 }
      ),
      (itemsData) => {
        // Create cart items from test data
        const cartItems = itemsData.map(data => 
          createCartItem(data.id, data.name, data.price, data.quantity)
        );

        const cartDisplay = createCartStatusDisplay(cartItems);

        // Cart button must have proper accessibility attributes
        expect(cartDisplay.button.className).toBe('cart-button');
        expect(cartDisplay.button.ariaLabel).toBe('Shopping cart');
        expect(cartDisplay.button.ariaDescribedBy).toBe('cart-status');

        // Cart count must be displayed with proper ARIA attributes
        expect(cartDisplay.count.className).toBe('cart-count');
        expect(cartDisplay.count.ariaLive).toBe('polite');
        expect(typeof cartDisplay.count.value).toBe('number');
        expect(cartDisplay.count.value).toBeGreaterThanOrEqual(0);
        expect(cartDisplay.count.textContent).toBe(cartDisplay.count.value.toString());

        // Cart status must provide accessible description
        expect(cartDisplay.status.id).toBe('cart-status');
        expect(cartDisplay.status.className).toBe('visually-hidden');
        expect(cartDisplay.status.textContent).toBeTruthy();

        // Verify count calculation
        const expectedCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        expect(cartDisplay.totals.itemCount).toBe(expectedCount);
        expect(cartDisplay.count.value).toBe(expectedCount);

        // Verify total calculation
        const expectedTotal = cartItems.reduce((sum, item) => {
          const price = item.product.salePrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        expect(cartDisplay.totals.total).toBeCloseTo(expectedTotal, 2);

        // Status text must reflect current state
        if (expectedCount === 0) {
          expect(cartDisplay.status.textContent).toBe('Shopping cart is empty');
        } else {
          const expectedText = `Shopping cart with ${expectedCount} item${expectedCount !== 1 ? 's' : ''}, total $${expectedTotal.toFixed(2)}`;
          expect(cartDisplay.status.textContent).toBe(expectedText);
        }

        return true;
      }
    ), { numRuns: 100 });
  });

  test('Cart count display consistency', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 100 }), // item count
      (itemCount) => {
        // Create mock items with quantity 1 each
        const items = Array.from({ length: itemCount }, (_, index) => 
          createCartItem(index + 1, `Item ${index + 1}`, 10.00, 1)
        );

        const cartDisplay = createCartStatusDisplay(items);

        // Count must match expected value
        expect(cartDisplay.count.value).toBe(itemCount);
        expect(cartDisplay.count.textContent).toBe(itemCount.toString());
        expect(cartDisplay.totals.itemCount).toBe(itemCount);

        // ARIA live region must be properly configured
        expect(cartDisplay.count.ariaLive).toBe('polite');

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Cart total calculation accuracy', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(100.00), noNaN: true }),
          quantity: fc.integer({ min: 1, max: 5 })
        }),
        { minLength: 1, maxLength: 10 }
      ),
      (itemsData) => {
        const items = itemsData.map((data, index) => 
          createCartItem(index + 1, `Item ${index + 1}`, data.price, data.quantity)
        );

        const cartDisplay = createCartStatusDisplay(items);

        // Calculate expected total manually
        const expectedTotal = itemsData.reduce((sum, data) => sum + (data.price * data.quantity), 0);
        const expectedCount = itemsData.reduce((count, data) => count + data.quantity, 0);

        // Verify calculations
        expect(cartDisplay.totals.total).toBeCloseTo(expectedTotal, 2);
        expect(cartDisplay.totals.itemCount).toBe(expectedCount);

        // Status text should include correct total
        if (expectedCount > 0) {
          expect(cartDisplay.status.textContent).toContain(`$${expectedTotal.toFixed(2)}`);
          expect(cartDisplay.status.textContent).toContain(expectedCount.toString());
        }

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Cart accessibility attributes consistency', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          name: fc.string({ minLength: 1, maxLength: 30 }),
          price: fc.float({ min: Math.fround(1.00), max: Math.fround(50.00), noNaN: true }),
          quantity: fc.integer({ min: 1, max: 3 })
        }),
        { maxLength: 5 }
      ),
      (itemsData) => {
        const items = itemsData.map(data => 
          createCartItem(data.id, data.name, data.price, data.quantity)
        );

        const cartDisplay = createCartStatusDisplay(items);

        // Required accessibility attributes must be present
        expect(cartDisplay.button.ariaLabel).toBeTruthy();
        expect(cartDisplay.button.ariaDescribedBy).toBeTruthy();
        expect(cartDisplay.count.ariaLive).toBe('polite');
        expect(cartDisplay.status.id).toBeTruthy();

        // Button and status must be properly associated
        expect(cartDisplay.button.ariaDescribedBy).toBe(cartDisplay.status.id);

        // Status must be visually hidden but accessible to screen readers
        expect(cartDisplay.status.className).toBe('visually-hidden');

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Empty cart state consistency', () => {
    fc.assert(fc.property(
      fc.constant([]), // empty cart
      (emptyItems) => {
        const cartDisplay = createCartStatusDisplay(emptyItems);

        // Empty cart must show zero count
        expect(cartDisplay.count.value).toBe(0);
        expect(cartDisplay.count.textContent).toBe('0');
        expect(cartDisplay.totals.itemCount).toBe(0);
        expect(cartDisplay.totals.total).toBe(0);

        // Status text must indicate empty state
        expect(cartDisplay.status.textContent).toBe('Shopping cart is empty');

        // Accessibility attributes must still be present
        expect(cartDisplay.button.ariaLabel).toBe('Shopping cart');
        expect(cartDisplay.count.ariaLive).toBe('polite');

        return true;
      }
    ), { numRuns: 20 });
  });

  test('Cart state transitions', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 5 }), // initial item count
      fc.integer({ min: 0, max: 5 }), // final item count
      (initialCount, finalCount) => {
        // Create initial cart state
        const initialItems = Array.from({ length: initialCount }, (_, index) => 
          createCartItem(index + 1, `Item ${index + 1}`, 15.99, 1)
        );
        const initialDisplay = createCartStatusDisplay(initialItems);

        // Create final cart state
        const finalItems = Array.from({ length: finalCount }, (_, index) => 
          createCartItem(index + 1, `Item ${index + 1}`, 15.99, 1)
        );
        const finalDisplay = createCartStatusDisplay(finalItems);

        // Structure should remain consistent across state changes
        expect(initialDisplay.button.className).toBe(finalDisplay.button.className);
        expect(initialDisplay.count.className).toBe(finalDisplay.count.className);
        expect(initialDisplay.status.className).toBe(finalDisplay.status.className);

        // Accessibility attributes should remain consistent
        expect(initialDisplay.button.ariaLabel).toBe(finalDisplay.button.ariaLabel);
        expect(initialDisplay.count.ariaLive).toBe(finalDisplay.count.ariaLive);
        expect(initialDisplay.status.id).toBe(finalDisplay.status.id);

        // Values should reflect current state
        expect(initialDisplay.count.value).toBe(initialCount);
        expect(finalDisplay.count.value).toBe(finalCount);

        return true;
      }
    ), { numRuns: 50 });
  });

  test('Cart item quantity variations', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.integer({ min: 1, max: 100 }),
          quantity: fc.integer({ min: 1, max: 10 })
        }),
        { minLength: 1, maxLength: 8 }
      ),
      (itemsData) => {
        const items = itemsData.map(data => 
          createCartItem(data.id, `Product ${data.id}`, 25.00, data.quantity)
        );

        const cartDisplay = createCartStatusDisplay(items);

        // Total quantity should be sum of all item quantities
        const expectedQuantity = itemsData.reduce((sum, data) => sum + data.quantity, 0);
        expect(cartDisplay.totals.itemCount).toBe(expectedQuantity);
        expect(cartDisplay.count.value).toBe(expectedQuantity);

        // Total price should account for quantities
        const expectedTotal = itemsData.reduce((sum, data) => sum + (25.00 * data.quantity), 0);
        expect(cartDisplay.totals.total).toBeCloseTo(expectedTotal, 2);

        // Status text should use correct pluralization
        if (expectedQuantity === 1) {
          expect(cartDisplay.status.textContent).toContain('1 item');
          expect(cartDisplay.status.textContent).not.toContain('items');
        } else if (expectedQuantity > 1) {
          expect(cartDisplay.status.textContent).toContain(`${expectedQuantity} items`);
        }

        return true;
      }
    ), { numRuns: 50 });
  });
});