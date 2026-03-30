/**
 * Service Worker for Ecommerce Homepage
 * Provides offline functionality and advanced caching strategies
 */

const CACHE_NAME = 'ecommerce-homepage-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Cache configuration
const CACHE_CONFIG = {
  staticAssets: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    assets: [
      '/',
      '/index.html',
      '/offline.html',
      '/styles.css',
      '/js/main.js',
      '/js/homepage/base-module.js',
      '/js/homepage/navigation.js',
      '/js/homepage/search.js',
      '/js/homepage/cart.js',
      '/js/homepage/product.js',
      '/js/homepage/accessibility.js',
      '/js/homepage/performance.js',
      '/favicon.ico'
    ]
  },
  dynamicAssets: {
    images: { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 100
    },
    api: { 
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 50
    }
  }
};

// Install event - cache static assets with compression
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets with compression');
        return cache.addAll(CACHE_CONFIG.staticAssets.assets);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches and setup new cache structure
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Initialize new cache structure
      initializeCacheStructure(),
      // Claim clients
      self.clients.claim()
    ])
  );
});

/**
 * Initialize cache structure with proper headers
 */
async function initializeCacheStructure() {
  const caches = await Promise.all([
    caches.open(STATIC_CACHE),
    caches.open(DYNAMIC_CACHE),
    caches.open(IMAGE_CACHE),
    caches.open(API_CACHE)
  ]);
  
  console.log('Cache structure initialized');
  return caches;
}

// Fetch event - advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (except for known CDNs)
  if (url.origin !== location.origin && !isAllowedExternalDomain(url.origin)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle request with appropriate caching strategy
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Static assets - Cache First strategy
  if (isStaticAsset(url.pathname)) {
    return handleStaticAsset(request);
  }
  
  // Images - Cache First with expiration
  if (isImageRequest(request)) {
    return handleImageRequest(request);
  }
  
  // API requests - Network First with cache fallback
  if (isAPIRequest(url.pathname)) {
    return handleAPIRequest(request);
  }
  
  // HTML documents - Network First with cache fallback
  if (request.destination === 'document') {
    return handleDocumentRequest(request);
  }
  
  // Default - Network First
  return handleDefaultRequest(request);
}

/**
 * Handle static asset requests (CSS, JS, fonts)
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTime = new Date(cachedResponse.headers.get('date')).getTime();
    const now = Date.now();
    
    if (now - cacheTime < CACHE_CONFIG.staticAssets.maxAge) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Add compression and cache headers
      const responseToCache = addCacheHeaders(networkResponse.clone(), 'static');
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Handle image requests with size limits
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTime = new Date(cachedResponse.headers.get('date')).getTime();
    const now = Date.now();
    
    if (now - cacheTime < CACHE_CONFIG.dynamicAssets.images.maxAge) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Check cache size and clean if necessary
      await cleanImageCache();
      
      // Add optimized headers
      const responseToCache = addCacheHeaders(networkResponse.clone(), 'image');
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version or placeholder
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createImagePlaceholder();
  }
}

/**
 * Handle API requests with short-term caching
 */
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      
      // Clean old API cache entries
      await cleanAPICache();
      
      // Cache with short expiration
      const responseToCache = addCacheHeaders(networkResponse.clone(), 'api');
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheTime = new Date(cachedResponse.headers.get('date')).getTime();
      const now = Date.now();
      
      if (now - cacheTime < CACHE_CONFIG.dynamicAssets.api.maxAge) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Handle document requests
 */
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Serve cached version or offline page
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page for navigation requests
    return caches.match('/offline.html');
  }
}

/**
 * Handle default requests
 */
async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Add appropriate cache headers to response
 */
function addCacheHeaders(response, type) {
  const headers = new Headers(response.headers);
  
  switch (type) {
    case 'static':
      headers.set('Cache-Control', 'max-age=31536000, immutable');
      break;
    case 'image':
      headers.set('Cache-Control', 'max-age=2592000');
      break;
    case 'api':
      headers.set('Cache-Control', 'max-age=300');
      break;
    default:
      headers.set('Cache-Control', 'max-age=3600');
  }
  
  headers.set('date', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

/**
 * Clean image cache to maintain size limits
 */
async function cleanImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  
  if (keys.length > CACHE_CONFIG.dynamicAssets.images.maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - CACHE_CONFIG.dynamicAssets.images.maxEntries);
    
    await Promise.all(
      keysToDelete.map(key => cache.delete(key))
    );
    
    console.log(`Cleaned ${keysToDelete.length} old image cache entries`);
  }
}

/**
 * Clean API cache to maintain size limits
 */
async function cleanAPICache() {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  
  if (keys.length > CACHE_CONFIG.dynamicAssets.api.maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - CACHE_CONFIG.dynamicAssets.api.maxEntries);
    
    await Promise.all(
      keysToDelete.map(key => cache.delete(key))
    );
    
    console.log(`Cleaned ${keysToDelete.length} old API cache entries`);
  }
}

/**
 * Create image placeholder for failed loads
 */
function createImagePlaceholder() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <text x="200" y="150" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="16">
        Image unavailable
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  return /\.(css|js|woff2?|ttf|otf)$/.test(pathname);
}

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(request.url);
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

/**
 * Check if external domain is allowed
 */
function isAllowedExternalDomain(origin) {
  const allowedDomains = [
    'https://images.unsplash.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com'
  ];
  
  return allowedDomains.includes(origin);
}

// Background sync for cart updates and offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'user-preferences-sync') {
    event.waitUntil(syncUserPreferences());
  }
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

// Push notifications for offline updates
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New updates available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification('ShoppingSpree', options)
  );
});

// Notification click handling with offline support
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

/**
 * Sync cart data when back online
 */
async function syncCartData() {
  try {
    console.log('Syncing cart data...');
    
    // Get cart data from IndexedDB
    const cartData = await getStoredCartData();
    
    if (cartData && cartData.pendingUpdates && cartData.pendingUpdates.length > 0) {
      // Send pending cart updates to server
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates: cartData.pendingUpdates,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        // Clear pending updates
        await clearPendingCartUpdates();
        console.log('Cart data synced successfully');
        
        // Notify all clients about successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'CART_SYNC_SUCCESS',
            data: cartData
          });
        });
      } else {
        throw new Error(`Sync failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Failed to sync cart data:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CART_SYNC_FAILED',
        error: error.message
      });
    });
  }
}

/**
 * Sync user preferences when back online
 */
async function syncUserPreferences() {
  try {
    console.log('Syncing user preferences...');
    
    const preferences = await getStoredUserPreferences();
    
    if (preferences && preferences.pendingUpdates) {
      const response = await fetch('/api/user/preferences/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences.pendingUpdates)
      });
      
      if (response.ok) {
        await clearPendingPreferenceUpdates();
        console.log('User preferences synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync user preferences:', error);
  }
}

/**
 * Sync analytics data when back online
 */
async function syncAnalyticsData() {
  try {
    console.log('Syncing analytics data...');
    
    const analyticsData = await getStoredAnalyticsData();
    
    if (analyticsData && analyticsData.events && analyticsData.events.length > 0) {
      const response = await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: analyticsData.events,
          sessionId: analyticsData.sessionId
        })
      });
      
      if (response.ok) {
        await clearStoredAnalyticsData();
        console.log('Analytics data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync analytics data:', error);
  }
}

/**
 * Get stored cart data from IndexedDB
 */
async function getStoredCartData() {
  try {
    // Open IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');
    
    return new Promise((resolve, reject) => {
      const request = store.get('cartData');
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get stored cart data:', error);
    return null;
  }
}

/**
 * Get stored user preferences from IndexedDB
 */
async function getStoredUserPreferences() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['preferences'], 'readonly');
    const store = transaction.objectStore('preferences');
    
    return new Promise((resolve, reject) => {
      const request = store.get('userPreferences');
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get stored user preferences:', error);
    return null;
  }
}

/**
 * Get stored analytics data from IndexedDB
 */
async function getStoredAnalyticsData() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['analytics'], 'readonly');
    const store = transaction.objectStore('analytics');
    
    return new Promise((resolve, reject) => {
      const request = store.get('analyticsData');
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get stored analytics data:', error);
    return null;
  }
}

/**
 * Clear pending cart updates from IndexedDB
 */
async function clearPendingCartUpdates() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');
    
    const cartData = await new Promise((resolve, reject) => {
      const request = store.get('cartData');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (cartData) {
      cartData.pendingUpdates = [];
      cartData.lastSyncTime = Date.now();
      
      return new Promise((resolve, reject) => {
        const request = store.put(cartData, 'cartData');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('Failed to clear pending cart updates:', error);
  }
}

/**
 * Clear pending preference updates from IndexedDB
 */
async function clearPendingPreferenceUpdates() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['preferences'], 'readwrite');
    const store = transaction.objectStore('preferences');
    
    const preferences = await new Promise((resolve, reject) => {
      const request = store.get('userPreferences');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (preferences) {
      preferences.pendingUpdates = null;
      preferences.lastSyncTime = Date.now();
      
      return new Promise((resolve, reject) => {
        const request = store.put(preferences, 'userPreferences');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } catch (error) {
    console.error('Failed to clear pending preference updates:', error);
  }
}

/**
 * Clear stored analytics data from IndexedDB
 */
async function clearStoredAnalyticsData() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['analytics'], 'readwrite');
    const store = transaction.objectStore('analytics');
    
    return new Promise((resolve, reject) => {
      const request = store.delete('analyticsData');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear stored analytics data:', error);
  }
}

/**
 * Open IndexedDB connection
 */
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShoppingSpreeDB', 1);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart');
      }
      
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences');
      }
      
      if (!db.objectStoreNames.contains('analytics')) {
        db.createObjectStore('analytics');
      }
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_CONFIG') {
    // Update cache configuration
    updateCacheConfig(event.data.config);
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear specific cache
    clearCache(event.data.cacheName);
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    // Return cache statistics
    getCacheStats().then(stats => {
      event.ports[0].postMessage({ type: 'CACHE_STATS', stats });
    });
  }
});

/**
 * Update cache configuration
 */
async function updateCacheConfig(newConfig) {
  Object.assign(CACHE_CONFIG, newConfig);
  console.log('Cache configuration updated:', CACHE_CONFIG);
}

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
  try {
    const success = await caches.delete(cacheName);
    console.log(`Cache ${cacheName} cleared:`, success);
    return success;
  } catch (error) {
    console.error(`Failed to clear cache ${cacheName}:`, error);
    return false;
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      entries: keys.length,
      urls: keys.map(key => key.url)
    };
  }
  
  return stats;
}