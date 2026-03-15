import { GuidelineEntry } from '../../types';

/**
 * Performance Architecture Guidelines
 * Create performance optimization guidelines for application structure
 */

export const performanceArchitectureGuidelines: GuidelineEntry = {
  id: 'architecture-performance',
  title: 'Performance Architecture Guidelines',
  category: 'architecture',
  priority: 'critical',
  description: 'Comprehensive guidelines for designing application architecture with performance optimization in mind, focusing on efficient data flow, resource management, and scalable patterns.',
  rules: [
    {
      statement: 'Implement lazy loading for non-critical resources',
      rationale: 'Lazy loading reduces initial bundle size and improves page load times by deferring the loading of non-essential components and resources.',
      implementation: 'Use dynamic imports for route components, code splitting for large libraries, and lazy loading for images and other media assets.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['bundle-analyzer', 'lighthouse']
      }
    },

    {
      statement: 'Design efficient data fetching strategies',
      rationale: 'Efficient data fetching reduces network overhead, improves user experience, and prevents unnecessary server load.',
      implementation: 'Implement data prefetching, request batching, caching strategies, and avoid over-fetching with precise query selection.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['network-monitor', 'performance-profiler']
      }
    },

    {
      statement: 'Optimize component rendering patterns',
      rationale: 'Efficient rendering prevents unnecessary re-renders, reduces CPU usage, and maintains smooth user interactions.',
      implementation: 'Use memoization, virtual scrolling for large lists, efficient state updates, and proper component lifecycle management.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['react-profiler', 'performance-monitor']
      }
    },

    {
      statement: 'Implement effective caching layers',
      rationale: 'Multi-level caching reduces server load, improves response times, and provides better offline capabilities.',
      implementation: 'Use browser caching, service workers, CDN caching, and application-level caching for frequently accessed data.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['cache-analyzer', 'network-inspector']
      }
    },

    {
      statement: 'Design scalable state management',
      rationale: 'Scalable state management prevents performance degradation as application complexity grows and ensures efficient updates.',
      implementation: 'Use normalized state structures, selective subscriptions, state slicing, and avoid deeply nested state objects.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['state-analyzer']
      }
    },

    {
      statement: 'Optimize asset delivery and bundling',
      rationale: 'Optimized asset delivery reduces bandwidth usage, improves load times, and enhances user experience across different network conditions.',
      implementation: 'Use code splitting, tree shaking, asset compression, and efficient bundling strategies with tools like Webpack or Vite.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['webpack-bundle-analyzer', 'lighthouse']
      }
    },

    {
      statement: 'Implement performance monitoring and metrics',
      rationale: 'Continuous performance monitoring enables proactive optimization and helps identify performance regressions before they impact users.',
      implementation: 'Track Core Web Vitals, implement performance budgets, use real user monitoring (RUM), and set up automated performance testing.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['web-vitals', 'performance-budget']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Lazy Loading Implementation',
      goodExample: `// Good: Comprehensive lazy loading strategy
import { lazy, Suspense } from 'react';

// Route-level code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Component-level lazy loading
const HeavyChart = lazy(() => import('./components/HeavyChart'));

// Image lazy loading with Intersection Observer
function LazyImage({ src, alt, className }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
}

// App with lazy loading
function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<div>Loading Dashboard...</div>}>
              <Dashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <Suspense fallback={<div>Loading Profile...</div>}>
              <UserProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <Suspense fallback={<div>Loading Analytics...</div>}>
              <Analytics />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}

// Dynamic library loading
async function loadChartLibrary() {
  const { Chart } = await import('chart.js');
  return Chart;
}`,
      badExample: `// Bad: Everything loaded upfront
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Analytics from './pages/Analytics';
import HeavyChart from './components/HeavyChart';
import Chart from 'chart.js'; // Large library loaded immediately

// All images loaded immediately
function ImageGallery({ images }) {
  return (
    <div>
      {images.map(image => (
        <img 
          key={image.id}
          src={image.url} // All images loaded at once
          alt={image.alt}
        />
      ))}
    </div>
  );
}

// All routes loaded in main bundle
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}`,
      explanation: 'The good example implements comprehensive lazy loading for routes, components, images, and libraries, reducing initial bundle size. The bad example loads everything upfront, creating large bundles and slow initial load times.'
    },

    {
      language: 'javascript',
      title: 'Efficient Data Fetching Strategies',
      goodExample: `// Good: Optimized data fetching with caching and batching
class DataManager {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.batchQueue = [];
    this.batchTimeout = null;
  }

  // Request batching to reduce network calls
  async batchFetch(requests) {
    return new Promise((resolve) => {
      this.batchQueue.push(...requests.map(req => ({ ...req, resolve })));
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, 50); // Batch requests within 50ms
    });
  }

  async processBatch() {
    if (this.batchQueue.length === 0) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: batch.map(({ type, id }) => ({ type, id }))
        })
      });
      
      const results = await response.json();
      
      batch.forEach((request, index) => {
        const result = results[index];
        this.cache.set(\`\${request.type}:\${request.id}\`, result);
        request.resolve(result);
      });
    } catch (error) {
      batch.forEach(request => request.resolve(null));
    }
  }

  // Cached fetch with deduplication
  async fetchWithCache(type, id) {
    const cacheKey = \`\${type}:\${id}\`;
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Deduplicate concurrent requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    const promise = this.batchFetch([{ type, id }]);
    this.pendingRequests.set(cacheKey, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // Prefetch related data
  async prefetchRelated(type, id) {
    const relatedIds = await this.getRelatedIds(type, id);
    const prefetchPromises = relatedIds.map(relatedId => 
      this.fetchWithCache(type, relatedId)
    );
    
    // Don't wait for prefetch to complete
    Promise.all(prefetchPromises).catch(() => {
      // Prefetch failures are non-critical
    });
  }
}

// Usage with React Query for additional optimizations
function useOptimizedData(type, id) {
  const dataManager = useRef(new DataManager()).current;
  
  return useQuery({
    queryKey: [type, id],
    queryFn: () => dataManager.fetchWithCache(type, id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: () => {
      // Prefetch related data
      dataManager.prefetchRelated(type, id);
    }
  });
}`,
      badExample: `// Bad: Inefficient data fetching
// No caching, no batching, no deduplication
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}

async function fetchUserPosts(userId) {
  const response = await fetch(\`/api/users/\${userId}/posts\`);
  return response.json();
}

async function fetchUserComments(userId) {
  const response = await fetch(\`/api/users/\${userId}/comments\`);
  return response.json();
}

// Component makes multiple separate requests
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Multiple separate requests - no batching
    fetchUser(userId).then(setUser);
    fetchUserPosts(userId).then(setPosts);
    fetchUserComments(userId).then(setComments);
    
    // No caching - refetches on every render
  }, [userId]);

  // Concurrent requests for same data not deduplicated
  useEffect(() => {
    fetchUser(userId).then(userData => {
      // Another request for same user data
    });
  }, [userId]);

  return (
    <div>
      {user && <UserInfo user={user} />}
      {posts.map(post => <PostItem key={post.id} post={post} />)}
      {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
    </div>
  );
}`,
      explanation: 'The good example implements request batching, caching, deduplication, and prefetching to minimize network overhead. The bad example makes multiple separate requests without optimization, leading to poor performance.'
    },

    {
      language: 'javascript',
      title: 'Optimized Component Rendering',
      goodExample: `// Good: Optimized rendering with memoization and virtualization
import { memo, useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

// Memoized list item to prevent unnecessary re-renders
const ListItem = memo(({ index, style, data }) => {
  const item = data[index];
  
  return (
    <div style={style} className="list-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span>{item.date}</span>
    </div>
  );
});

// Optimized list component with virtualization
const OptimizedList = memo(({ items, onItemClick }) => {
  // Memoize filtered and sorted data
  const processedItems = useMemo(() => {
    return items
      .filter(item => item.isVisible)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [items]);

  // Memoize callback to prevent child re-renders
  const handleItemClick = useCallback((item) => {
    onItemClick(item);
  }, [onItemClick]);

  // Virtual scrolling for large lists
  return (
    <List
      height={600}
      itemCount={processedItems.length}
      itemSize={80}
      itemData={processedItems}
    >
      {ListItem}
    </List>
  );
});

// Optimized parent component
function DataDashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  
  // Memoize expensive calculations
  const stats = useMemo(() => {
    return {
      total: items.length,
      visible: items.filter(item => item.isVisible).length,
      average: items.reduce((sum, item) => sum + item.value, 0) / items.length
    };
  }, [items]);

  // Memoize callback to prevent child re-renders
  const handleItemClick = useCallback((item) => {
    console.log('Item clicked:', item.id);
  }, []);

  // Debounced filter to prevent excessive re-renders
  const debouncedFilter = useMemo(() => {
    const timeoutId = setTimeout(() => {
      // Apply filter logic
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filter]);

  return (
    <div>
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Visible: {stats.visible}</span>
        <span>Average: {stats.average.toFixed(2)}</span>
      </div>
      
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      
      <OptimizedList 
        items={items} 
        onItemClick={handleItemClick}
      />
    </div>
  );
}`,
      badExample: `// Bad: Inefficient rendering patterns
// No memoization - re-renders on every parent update
function ListItem({ item, onItemClick }) {
  return (
    <div className="list-item" onClick={() => onItemClick(item)}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span>{new Date(item.date).toLocaleDateString()}</span> {/* Expensive operation on every render */}
    </div>
  );
}

// No virtualization - renders all items at once
function IneffientList({ items, onItemClick }) {
  // Expensive operations on every render
  const filteredItems = items.filter(item => item.isVisible);
  const sortedItems = filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return (
    <div>
      {sortedItems.map(item => (
        <ListItem 
          key={item.id} 
          item={item} 
          onItemClick={onItemClick} // New function on every render
        />
      ))}
    </div>
  );
}

// Parent component with performance issues
function DataDashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  
  // Expensive calculation on every render
  const stats = {
    total: items.length,
    visible: items.filter(item => item.isVisible).length,
    average: items.reduce((sum, item) => sum + item.value, 0) / items.length
  };

  return (
    <div>
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Visible: {stats.visible}</span>
        <span>Average: {stats.average.toFixed(2)}</span>
      </div>
      
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)} // No debouncing
        placeholder="Filter items..."
      />
      
      <IneffientList 
        items={items} 
        onItemClick={(item) => console.log('Item clicked:', item.id)} // New function every render
      />
    </div>
  );
}`,
      explanation: 'The good example uses memoization, virtualization, and optimized callbacks to prevent unnecessary re-renders and handle large datasets efficiently. The bad example performs expensive operations on every render and creates new functions unnecessarily.'
    },

    {
      language: 'javascript',
      title: 'Multi-Level Caching Strategy',
      goodExample: `// Good: Comprehensive caching strategy
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.sessionCache = sessionStorage;
    this.persistentCache = localStorage;
    this.maxMemorySize = 100; // Max items in memory
  }

  // Memory cache (fastest, limited size)
  setMemoryCache(key, value, ttl = 300000) { // 5 minutes default
    if (this.memoryCache.size >= this.maxMemorySize) {
      // Remove oldest entry
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  getMemoryCache(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  // Session cache (survives page refresh)
  setSessionCache(key, value) {
    try {
      this.sessionCache.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Handle storage quota exceeded
      this.clearOldSessionCache();
    }
  }

  getSessionCache(key, maxAge = 3600000) { // 1 hour default
    try {
      const cached = JSON.parse(this.sessionCache.getItem(key));
      if (!cached) return null;
      
      if (Date.now() - cached.timestamp > maxAge) {
        this.sessionCache.removeItem(key);
        return null;
      }
      
      return cached.value;
    } catch (e) {
      return null;
    }
  }

  // Persistent cache (survives browser restart)
  setPersistentCache(key, value) {
    try {
      this.persistentCache.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (e) {
      this.clearOldPersistentCache();
    }
  }

  getPersistentCache(key, maxAge = 86400000) { // 24 hours default
    try {
      const cached = JSON.parse(this.persistentCache.getItem(key));
      if (!cached) return null;
      
      if (Date.now() - cached.timestamp > maxAge) {
        this.persistentCache.removeItem(key);
        return null;
      }
      
      return cached.value;
    } catch (e) {
      return null;
    }
  }

  // Unified cache interface
  async get(key, options = {}) {
    const { useMemory = true, useSession = true, usePersistent = true } = options;
    
    // Check memory cache first (fastest)
    if (useMemory) {
      const memoryResult = this.getMemoryCache(key);
      if (memoryResult !== null) return memoryResult;
    }
    
    // Check session cache
    if (useSession) {
      const sessionResult = this.getSessionCache(key);
      if (sessionResult !== null) {
        // Promote to memory cache
        if (useMemory) this.setMemoryCache(key, sessionResult);
        return sessionResult;
      }
    }
    
    // Check persistent cache
    if (usePersistent) {
      const persistentResult = this.getPersistentCache(key);
      if (persistentResult !== null) {
        // Promote to higher levels
        if (useSession) this.setSessionCache(key, persistentResult);
        if (useMemory) this.setMemoryCache(key, persistentResult);
        return persistentResult;
      }
    }
    
    return null;
  }

  async set(key, value, options = {}) {
    const { 
      useMemory = true, 
      useSession = true, 
      usePersistent = false,
      ttl = 300000 
    } = options;
    
    if (useMemory) this.setMemoryCache(key, value, ttl);
    if (useSession) this.setSessionCache(key, value);
    if (usePersistent) this.setPersistentCache(key, value);
  }
}

// Service Worker for network caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js - Service Worker implementation
const CACHE_NAME = 'app-cache-v1';
const STATIC_CACHE = 'static-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    })
  );
});`,
      badExample: `// Bad: No caching strategy
// Every request goes to the network
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

// No service worker, no local caching
function DataComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Always fetches from network, even for repeated requests
    fetchData('/api/data').then(setData);
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}

// No cache headers, no optimization
app.get('/api/data', (req, res) => {
  // No cache control headers
  res.json({ data: 'some data' });
});`,
      explanation: 'The good example implements a comprehensive multi-level caching strategy with memory, session, persistent, and network caching. The bad example has no caching, resulting in unnecessary network requests and poor performance.'
    }
  ],
  relatedGuidelines: [
    'architecture-data-flow',
    'architecture-modularity',
    'performance-optimization',
    'testing-performance'
  ]
};