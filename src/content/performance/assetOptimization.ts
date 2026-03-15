import { GuidelineEntry } from '../../types';

/**
 * Asset Optimization and Caching Guidelines
 * Comprehensive rules for optimizing assets and implementing caching strategies
 */

export const assetOptimizationGuidelines: GuidelineEntry = {
  id: 'performance-asset-optimization',
  title: 'Asset Optimization and Caching',
  category: 'performance',
  priority: 'critical',
  description: 'Guidelines for optimizing web assets and implementing effective caching strategies to improve loading times and reduce bandwidth usage.',
  rules: [
    {
      statement: 'Implement HTTP caching headers for static assets',
      rationale: 'Proper caching reduces server load, decreases bandwidth usage, and significantly improves page load times for returning visitors.',
      implementation: 'Set appropriate Cache-Control, ETag, and Last-Modified headers. Use long cache times for versioned assets and shorter times for frequently updated content.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['cache-header-checker', 'lighthouse-audit']
      }
    },

    {
      statement: 'Use content delivery networks (CDN) for static assets',
      rationale: 'CDNs serve content from geographically distributed servers, reducing latency and improving load times for users worldwide.',
      implementation: 'Configure CDN for CSS, JavaScript, images, and other static assets. Use CDN-specific optimization features like automatic compression.',
      validation: {
        method: 'performance-testing',
        automated: true,
        tools: ['cdn-performance-monitor']
      }
    },

    {
      statement: 'Minimize and compress CSS and JavaScript files',
      rationale: 'Minification removes unnecessary characters and compression reduces file sizes, leading to faster downloads and parsing.',
      implementation: 'Use build tools to minify CSS/JS files and enable gzip/brotli compression on the server. Remove unused code and dependencies.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['minification-checker', 'compression-analyzer']
      }
    },

    {
      statement: 'Optimize images with appropriate formats and compression',
      rationale: 'Images often represent the largest portion of page weight. Proper optimization can dramatically reduce load times.',
      implementation: 'Use modern formats (WebP, AVIF), implement responsive images with srcset, and compress images without visible quality loss.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['image-optimization-checker']
      }
    },

    {
      statement: 'Implement resource bundling and code splitting',
      rationale: 'Bundling reduces HTTP requests while code splitting ensures users only download necessary code, improving initial load times.',
      implementation: 'Bundle related assets together, implement dynamic imports for route-based code splitting, and use tree shaking to eliminate dead code.',
      validation: {
        method: 'bundle-analysis',
        automated: true,
        tools: ['webpack-bundle-analyzer', 'rollup-analyzer']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'HTTP Caching Configuration (Express.js)',
      goodExample: `// Good: Comprehensive caching strategy
const express = require('express');
const path = require('path');
const app = express();

// Static assets with long cache times (versioned files)
app.use('/static', express.static('public', {
  maxAge: '1y', // 1 year for versioned assets
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set specific headers based on file type
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));

// API responses with appropriate caching
app.get('/api/data', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  res.setHeader('ETag', generateETag(data));
  res.json(data);
});`,
      badExample: `// Bad: No caching strategy
const express = require('express');
const app = express();

// No cache headers set
app.use('/static', express.static('public'));

app.get('/api/data', (req, res) => {
  res.json(data); // No caching headers
});`,
      explanation: 'The good example implements a comprehensive caching strategy with different cache times for different asset types and proper ETag handling. The bad example provides no caching, forcing browsers to re-download assets on every request.'
    },

    {
      language: 'javascript',
      title: 'Webpack Asset Optimization Configuration',
      goodExample: `// Good: Comprehensive webpack optimization
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js',
    vendor: ['react', 'react-dom'] // Separate vendor bundle
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // Content-based hashing
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    
    // Gzip compression
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Brotli compression
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 8192,
      minRatio: 0.8
    })
  ]
};`,
      badExample: `// Bad: No optimization
module.exports = {
  mode: 'development', // Wrong mode for production
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' // No cache busting
  },
  
  // No optimization configuration
  // No compression
  // No code splitting
};`,
      explanation: 'The good example implements comprehensive optimization including minification, code splitting, content hashing for cache busting, and compression. The bad example lacks optimization and uses development mode.'
    },

    {
      language: 'html',
      title: 'Responsive Image Optimization',
      goodExample: `<!-- Good: Responsive images with modern formats -->
<picture>
  <!-- Modern formats for supporting browsers -->
  <source 
    srcset="hero-320.avif 320w,
            hero-640.avif 640w,
            hero-1024.avif 1024w,
            hero-1920.avif 1920w"
    sizes="(max-width: 320px) 280px,
           (max-width: 640px) 600px,
           (max-width: 1024px) 980px,
           1920px"
    type="image/avif">
  
  <source 
    srcset="hero-320.webp 320w,
            hero-640.webp 640w,
            hero-1024.webp 1024w,
            hero-1920.webp 1920w"
    sizes="(max-width: 320px) 280px,
           (max-width: 640px) 600px,
           (max-width: 1024px) 980px,
           1920px"
    type="image/webp">
  
  <!-- Fallback for older browsers -->
  <img 
    src="hero-1024.jpg"
    srcset="hero-320.jpg 320w,
            hero-640.jpg 640w,
            hero-1024.jpg 1024w,
            hero-1920.jpg 1920w"
    sizes="(max-width: 320px) 280px,
           (max-width: 640px) 600px,
           (max-width: 1024px) 980px,
           1920px"
    alt="Hero image description"
    loading="lazy"
    decoding="async">
</picture>`,
      badExample: `<!-- Bad: Single large image -->
<img src="hero-large.jpg" alt="Hero image" width="1920" height="1080">`,
      explanation: 'The good example uses responsive images with multiple formats and sizes, allowing browsers to choose the most appropriate version. The bad example forces all devices to download a large image regardless of screen size or format support.'
    },

    {
      language: 'javascript',
      title: 'Dynamic Import Code Splitting',
      goodExample: `// Good: Route-based code splitting with dynamic imports
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => 
  import('./pages/Dashboard').then(module => ({
    default: module.Dashboard
  }))
);

// Preload critical routes
const preloadDashboard = () => {
  import('./pages/Dashboard');
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/dashboard" 
            element={<Dashboard />}
            onMouseEnter={preloadDashboard} // Preload on hover
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Feature-based code splitting
async function loadFeature(featureName) {
  const module = await import(\`./features/\${featureName}\`);
  return module.default;
}`,
      badExample: `// Bad: Everything imported upfront
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import FeatureA from './features/FeatureA';
import FeatureB from './features/FeatureB';
import FeatureC from './features/FeatureC';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}`,
      explanation: 'The good example uses dynamic imports to split code by routes and features, loading only what\'s needed. The bad example imports everything upfront, creating a large initial bundle.'
    }
  ],
  relatedGuidelines: [
    'performance-responsive-design',
    'performance-media-handling',
    'performance-code-optimization'
  ]
};