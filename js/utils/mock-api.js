const MOCK_PRODUCTS = [
  {
    id: 'running-sneakers',
    name: 'Running Sneakers',
    price: 49.99,
    category: 'fashion',
    description: 'Lightweight sneakers designed for daily training.'
  },
  {
    id: 'wireless-headphones',
    name: 'Wireless Headphones',
    price: 149.99,
    category: 'electronics',
    description: 'Premium noise-cancelling headphones with 30-hour battery life.'
  },
  {
    id: 'travel-backpack',
    name: 'Travel Backpack',
    price: 39.99,
    category: 'travel',
    description: 'Durable carry-on backpack with expandable storage.'
  },
  {
    id: 'smart-watch',
    name: 'Smart Watch',
    price: 89.99,
    category: 'electronics',
    description: 'Advanced fitness tracking smartwatch with GPS.'
  },
  {
    id: 'designer-dress',
    name: 'Designer Dress',
    price: 129.99,
    category: 'fashion',
    description: 'Elegant evening dress crafted with premium fabrics.'
  }
];

const MOCK_SUGGESTIONS = [
  { text: 'running shoes', category: 'Footwear' },
  { text: 'wireless earbuds', category: 'Electronics' },
  { text: 'travel backpack', category: 'Accessories' },
  { text: 'smart watch', category: 'Wearables' },
  { text: 'designer dress', category: 'Apparel' },
  { text: 'home decor', category: 'Home & Living' },
  { text: 'yoga mat', category: 'Fitness' },
  { text: 'noise cancelling', category: 'Electronics' }
];

const MOCK_USER = {
  id: 'demo-user',
  name: 'Demo Shopper',
  email: 'demo@shoppingspree.test'
};

let mockPreferences = {
  theme: 'vibrant',
  interests: ['electronics', 'fashion'],
  currency: 'USD'
};

const MOCK_RECOMMENDATIONS = [
  {
    id: 'precision-camera',
    name: 'Precision Pro Camera',
    price: 899.99,
    rating: 4.8
  },
  {
    id: 'ultra-laptop',
    name: 'Ultra-thin Laptop',
    price: 1299.0,
    rating: 4.6
  },
  {
    id: 'velvet-cushion',
    name: 'Velvet Soft Cushion',
    price: 24.99,
    rating: 4.7
  }
];

const MOCK_DELAY_MIN = 80;
const MOCK_DELAY_MAX = 180;

function isLocalhost() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateNetworkDelay() {
  const jitter = Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN;
  await delay(jitter);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

function filterProducts(query) {
  if (!query) {
    return MOCK_PRODUCTS;
  }

  const normalized = query.toLowerCase();
  return MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(normalized) ||
    product.category.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized)
  );
}

function filterSuggestions(query) {
  if (!query) {
    return MOCK_SUGGESTIONS;
  }

  const normalized = query.toLowerCase();
  return MOCK_SUGGESTIONS.filter(item =>
    (item.text || '').toLowerCase().includes(normalized)
  );
}

export function setupMockApi() {
  if (!isLocalhost()) {
    return;
  }

  if (window.__MOCK_API_INITIALIZED__) {
    return;
  }

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(requestUrl, window.location.origin);
    const pathname = url.pathname;

    // Search API
    if (pathname.startsWith('/api/search')) {
      const query = url.searchParams.get('q') || '';
      await simulateNetworkDelay();
      return jsonResponse({ results: filterProducts(query) });
    }

    // Suggestions API
    if (pathname.startsWith('/api/suggestions')) {
      const query = url.searchParams.get('q') || '';
      const limit = Number(url.searchParams.get('limit') || 8);
      await simulateNetworkDelay();
      return jsonResponse({ suggestions: filterSuggestions(query).slice(0, limit) });
    }

    // Featured products prefetch
    if (pathname.startsWith('/api/products/featured')) {
      await simulateNetworkDelay();
      return jsonResponse({ products: MOCK_PRODUCTS });
    }

    // Auth validation
    if (pathname === '/api/auth/validate') {
      await simulateNetworkDelay();
      return jsonResponse({ valid: true, user: MOCK_USER });
    }

    if (pathname === '/api/auth/logout') {
      await simulateNetworkDelay();
      return jsonResponse({ success: true });
    }

    // User preferences (GET/PUT)
    if (pathname === '/api/user/preferences') {
      if ((init.method || 'GET').toUpperCase() === 'GET') {
        await simulateNetworkDelay();
        return jsonResponse({ preferences: mockPreferences });
      }

      if ((init.method || 'GET').toUpperCase() === 'PUT') {
        try {
          const body = init.body ? JSON.parse(init.body) : {};
          mockPreferences = { ...mockPreferences, ...body };
        } catch (error) {
          console.warn('[MockAPI] Failed to parse preferences payload:', error);
        }
        await simulateNetworkDelay();
        return jsonResponse({ preferences: mockPreferences });
      }
    }

    // Personalized recommendations
    if (pathname === '/api/user/recommendations') {
      await simulateNetworkDelay();
      return jsonResponse({ recommendations: MOCK_RECOMMENDATIONS });
    }

    // Default fallback - use native fetch if available
    if (originalFetch) {
      return originalFetch(input, init);
    }

    // If fetch is unavailable (unlikely), throw error
    throw new Error('Fetch is not available in this environment.');
  };

  window.__MOCK_API_INITIALIZED__ = true;
  window.__USE_MOCK_API__ = true;
  console.info('[MockAPI] Local API interceptors enabled.');
}
