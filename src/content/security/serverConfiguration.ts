import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';

/**
 * Server Security Configuration Guidelines
 * Create rules for security headers and HTTPS configuration
 */

export const serverConfigurationGuidelines = new GuidelineEntry({
  id: 'security-server-configuration',
  title: 'Server Security Configuration',
  category: 'security',
  priority: 'critical',
  description: 'Comprehensive guidelines for configuring web servers securely, including security headers, HTTPS setup, and server hardening practices.',
  rules: [
    new Rule({
      statement: 'Enforce HTTPS for all connections',
      rationale: 'HTTPS encrypts data in transit, preventing eavesdropping, tampering, and man-in-the-middle attacks.',
      implementation: 'Use TLS 1.3, redirect HTTP to HTTPS, implement HSTS headers, and use secure cipher suites.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['https-checker']
      }
    }),

    new Rule({
      statement: 'Implement comprehensive security headers',
      rationale: 'Security headers provide defense-in-depth protection against various attacks including XSS, clickjacking, and content injection.',
      implementation: 'Set Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and other security headers.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['security-headers-checker']
      }
    }),

    new Rule({
      statement: 'Disable unnecessary server information disclosure',
      rationale: 'Server information disclosure helps attackers identify vulnerabilities and plan targeted attacks.',
      implementation: 'Remove or modify server banners, error page details, and version information from HTTP headers.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['server-info-checker']
      }
    }),

    new Rule({
      statement: 'Configure secure cookie settings',
      rationale: 'Insecure cookie configuration can lead to session hijacking and cross-site attacks.',
      implementation: 'Set Secure, HttpOnly, and SameSite flags on all cookies containing sensitive data.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['cookie-security-checker']
      }
    }),

    new Rule({
      statement: 'Implement rate limiting and DDoS protection',
      rationale: 'Rate limiting prevents abuse, brute force attacks, and helps maintain service availability under attack.',
      implementation: 'Configure rate limits per IP, implement progressive delays, and use DDoS protection services.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['rate-limit-checker']
      }
    }),

    new Rule({
      statement: 'Keep server software and dependencies updated',
      rationale: 'Outdated software contains known vulnerabilities that attackers actively exploit.',
      implementation: 'Establish regular update schedules, monitor security advisories, and use automated patching where appropriate.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['update-checker']
      }
    })
  ],
  examples: [
    new CodeExample({
      language: 'javascript',
      title: 'Express.js Security Headers Configuration',
      goodExample: `// Good: Comprehensive security headers setup
const express = require('express');
const helmet = require('helmet');

const app = express();

// Use Helmet for basic security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Additional custom security headers
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// Force HTTPS redirect
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(\`https://\${req.header('host')}\${req.url}\`);
  } else {
    next();
  }
});`,
      badExample: `// Bad: No security headers
const express = require('express');
const app = express();

// No security headers configured
app.get('/', (req, res) => {
  res.send('Hello World');
});`,
      explanation: 'The good example uses Helmet middleware and custom headers to implement comprehensive security protections. The bad example has no security headers, leaving the application vulnerable to various attacks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Rate Limiting Implementation',
      goodExample: `// Good: Comprehensive rate limiting
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

// Progressive delay for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/auth/', speedLimiter);

// Custom rate limiting with Redis for distributed systems
const redis = require('redis');
const client = redis.createClient();

async function customRateLimit(req, res, next) {
  const key = \`rate_limit:\${req.ip}\`;
  const current = await client.incr(key);
  
  if (current === 1) {
    await client.expire(key, 3600); // 1 hour window
  }
  
  if (current > 1000) { // 1000 requests per hour
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: await client.ttl(key)
    });
  }
  
  res.setHeader('X-RateLimit-Limit', 1000);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, 1000 - current));
  
  next();
}`,
      badExample: `// Bad: No rate limiting
app.post('/api/login', (req, res) => {
  // No protection against brute force attacks
  authenticateUser(req.body.username, req.body.password);
});`,
      explanation: 'The good example implements multiple layers of rate limiting with different strategies for different endpoints. The bad example has no rate limiting, making it vulnerable to brute force and DDoS attacks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Secure Cookie Configuration',
      goodExample: `// Good: Secure cookie configuration
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  name: 'sessionId', // Don't use default session name
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: 'strict' // CSRF protection
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy session update
  })
}));

// Custom secure cookie helper
function setSecureCookie(res, name, value, options = {}) {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    ...options
  };
  
  res.cookie(name, value, defaultOptions);
}

// Usage
app.post('/api/login', (req, res) => {
  // ... authentication logic ...
  if (authenticated) {
    setSecureCookie(res, 'auth_token', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
});`,
      badExample: `// Bad: Insecure cookie configuration
app.use(session({
  secret: 'hardcoded-secret',
  cookie: {
    secure: false, // Not HTTPS only
    httpOnly: false, // Accessible via JavaScript
    sameSite: 'none' // No CSRF protection
  }
}));

// Setting cookies without security flags
res.cookie('user_id', userId);`,
      explanation: 'The good example configures cookies with all necessary security flags and uses environment-specific settings. The bad example uses insecure cookie settings that are vulnerable to various attacks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'HTTPS and TLS Configuration',
      goodExample: `// Good: Secure HTTPS configuration
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// TLS configuration
const tlsOptions = {
  key: fs.readFileSync(process.env.TLS_KEY_PATH),
  cert: fs.readFileSync(process.env.TLS_CERT_PATH),
  
  // Use only secure TLS versions
  secureProtocol: 'TLSv1_3_method',
  
  // Secure cipher suites
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  
  // Prefer server cipher order
  honorCipherOrder: true,
  
  // Disable compression to prevent CRIME attacks
  compression: false
};

// Create HTTPS server
const httpsServer = https.createServer(tlsOptions, app);

// HTTP to HTTPS redirect server
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(301, \`https://\${req.headers.host}\${req.url}\`);
});

// Start servers
httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

httpApp.listen(80, () => {
  console.log('HTTP redirect server running on port 80');
});

// HSTS header middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});`,
      badExample: `// Bad: HTTP only server
const http = require('http');
const express = require('express');

const app = express();

// No HTTPS, no encryption
const server = http.createServer(app);
server.listen(80, () => {
  console.log('HTTP Server running on port 80');
});`,
      explanation: 'The good example implements secure HTTPS with proper TLS configuration, cipher suites, and HTTP-to-HTTPS redirection. The bad example uses HTTP only, leaving all data transmission unencrypted.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Server Information Hiding',
      goodExample: `// Good: Hide server information
const express = require('express');
const app = express();

// Remove X-Powered-By header
app.disable('x-powered-by');

// Custom middleware to remove/modify server headers
app.use((req, res, next) => {
  // Remove server header
  res.removeHeader('Server');
  
  // Or set custom server header
  res.setHeader('Server', 'WebServer');
  
  next();
});

// Custom error handler that doesn't leak information
app.use((err, req, res, next) => {
  // Log error details internally
  console.error('Error:', err);
  
  // Send generic error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    // Don't include stack trace in production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler that doesn't reveal file structure
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});`,
      badExample: `// Bad: Revealing server information
const express = require('express');
const app = express();

// Default Express setup reveals information
// X-Powered-By: Express header is sent

// Error handler that leaks information
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // Reveals internal structure
    file: err.fileName, // Reveals file paths
    line: err.lineNumber
  });
});`,
      explanation: 'The good example removes or modifies server headers and implements secure error handling that does not leak sensitive information. The bad example reveals server technology and internal structure through headers and error messages.'
    })
  ],
  relatedGuidelines: [
    'security-input-validation',
    'security-authentication',
    'security-data-protection'
  ]
});