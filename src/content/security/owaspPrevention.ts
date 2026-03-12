import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';

/**
 * OWASP Top 10 Prevention Strategies
 * Comprehensive prevention guidelines for each OWASP threat
 */

export const owaspPreventionGuidelines = new GuidelineEntry({
  id: 'security-owasp-prevention',
  title: 'OWASP Top 10 Prevention Strategies',
  category: 'security',
  priority: 'critical',
  description: 'Comprehensive prevention strategies for the OWASP Top 10 web application security risks, including injection attacks, broken authentication, sensitive data exposure, and other critical vulnerabilities.',
  rules: [
    new Rule({
      statement: 'Prevent injection attacks through input validation and parameterized queries',
      rationale: 'Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query, allowing attackers to execute malicious code.',
      implementation: 'Use parameterized queries, input validation, whitelist validation, and escape special characters for all user inputs.',
      validation: {
        method: 'static-analysis',
        automated: true,
        tools: ['injection-scanner']
      }
    }),

    new Rule({
      statement: 'Implement secure authentication and session management',
      rationale: 'Broken authentication allows attackers to compromise passwords, keys, or session tokens to assume user identities.',
      implementation: 'Use strong password policies, multi-factor authentication, secure session management, and account lockout mechanisms.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['auth-review']
      }
    }),

    new Rule({
      statement: 'Protect sensitive data through encryption and access controls',
      rationale: 'Sensitive data exposure occurs when applications do not adequately protect sensitive information like financial data, healthcare records, or personal information.',
      implementation: 'Encrypt data at rest and in transit, implement proper key management, and classify data sensitivity levels.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['encryption-validator']
      }
    }),

    new Rule({
      statement: 'Prevent XML External Entity (XXE) attacks',
      rationale: 'XXE attacks occur when XML input containing a reference to an external entity is processed by a weakly configured XML parser.',
      implementation: 'Disable XML external entity processing, use simple data formats like JSON, and validate XML inputs.',
      validation: {
        method: 'static-analysis',
        automated: true,
        tools: ['xxe-scanner']
      }
    }),

    new Rule({
      statement: 'Implement proper access controls and authorization',
      rationale: 'Broken access control allows users to access unauthorized functionality or data by bypassing access control checks.',
      implementation: 'Implement role-based access control, verify permissions on every request, and deny access by default.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['access-control-review']
      }
    }),

    new Rule({
      statement: 'Maintain secure security configurations',
      rationale: 'Security misconfiguration is the most common issue, often resulting from insecure default configurations or incomplete configurations.',
      implementation: 'Use security hardening guides, remove default accounts, disable unnecessary features, and regularly review configurations.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['config-scanner']
      }
    }),

    new Rule({
      statement: 'Prevent Cross-Site Scripting (XSS) attacks',
      rationale: 'XSS flaws occur when applications include untrusted data in web pages without proper validation or escaping.',
      implementation: 'Validate all inputs, encode outputs based on context, use Content Security Policy, and sanitize HTML content.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['xss-scanner']
      }
    }),

    new Rule({
      statement: 'Secure deserialization processes',
      rationale: 'Insecure deserialization can lead to remote code execution, replay attacks, injection attacks, and privilege escalation.',
      implementation: 'Avoid deserializing untrusted data, implement integrity checks, and isolate deserialization in low-privilege environments.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['deserialization-review']
      }
    }),

    new Rule({
      statement: 'Use components with known vulnerabilities management',
      rationale: 'Components with known vulnerabilities can undermine application defenses and enable various attacks.',
      implementation: 'Maintain inventory of components, monitor for vulnerabilities, update regularly, and remove unused dependencies.',
      validation: {
        method: 'Scan dependencies for known vulnerabilities',
        automated: true
      }
    }),

    new Rule({
      statement: 'Implement comprehensive logging and monitoring',
      rationale: 'Insufficient logging and monitoring allows attackers to maintain persistence, pivot to more systems, and tamper with data.',
      implementation: 'Log security events, monitor for suspicious activities, implement alerting, and maintain audit trails.',
      validation: {
        method: 'Verify logging covers all security-relevant events',
        automated: false
      }
    })
  ],
  examples: [
    new CodeExample({
      language: 'javascript',
      title: 'SQL Injection Prevention',
      goodExample: `// Good: Parameterized queries prevent SQL injection
const mysql = require('mysql2/promise');

class UserRepository {
  constructor(connection) {
    this.db = connection;
  }
  
  async getUserByEmail(email) {
    // Parameterized query - safe from SQL injection
    const [rows] = await this.db.execute(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }
  
  async searchUsers(searchTerm, limit = 10) {
    // Multiple parameters, still safe
    const [rows] = await this.db.execute(
      'SELECT id, email, name FROM users WHERE name LIKE ? LIMIT ?',
      [\`%\${searchTerm}%\`, limit]
    );
    return rows;
  }
  
  // Using ORM (Sequelize example)
  async findUsersByRole(role) {
    return await User.findAll({
      where: {
        role: role // Automatically parameterized
      }
    });
  }
}`,
      badExample: `// Bad: String concatenation creates SQL injection vulnerability
async function getUserByEmail(email) {
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  const result = await db.query(query);
  return result;
}

// Vulnerable to: email = "'; DROP TABLE users; --"`,
      explanation: 'The good example uses parameterized queries that separate SQL code from data, preventing injection attacks. The bad example concatenates user input directly into SQL strings, creating injection vulnerabilities.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'XSS Prevention with Output Encoding',
      goodExample: `// Good: Proper output encoding prevents XSS
const he = require('he'); // HTML entities library
const DOMPurify = require('dompurify');

class OutputEncoder {
  // HTML context encoding
  static encodeHTML(text) {
    return he.encode(text, {
      useNamedReferences: true,
      decimal: false
    });
  }
  
  // JavaScript context encoding
  static encodeJS(text) {
    return text.replace(/[\\\\'"\\r\\n\\u2028\\u2029]/g, (char) => {
      switch (char) {
        case '\\\\': return '\\\\\\\\';
        case "'": return "\\\\'";
        case '"': return '\\\\"';
        case '\\r': return '\\\\r';
        case '\\n': return '\\\\n';
        case '\\u2028': return '\\\\u2028';
        case '\\u2029': return '\\\\u2029';
        default: return char;
      }
    });
  }
  
  // URL context encoding
  static encodeURL(text) {
    return encodeURIComponent(text);
  }
  
  // Rich text sanitization
  static sanitizeHTML(html) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }
}

// Template usage with proper encoding
function renderUserProfile(user) {
  return \`
    <div class="profile">
      <h1>\${OutputEncoder.encodeHTML(user.name)}</h1>
      <p>\${OutputEncoder.encodeHTML(user.bio)}</p>
      <script>
        var userName = '\${OutputEncoder.encodeJS(user.name)}';
      </script>
      <a href="/user/\${OutputEncoder.encodeURL(user.id)}">Profile Link</a>
    </div>
  \`;
}`,
      badExample: `// Bad: No output encoding allows XSS
function renderUserProfile(user) {
  return \`
    <div class="profile">
      <h1>\${user.name}</h1>
      <p>\${user.bio}</p>
      <script>
        var userName = '\${user.name}';
      </script>
    </div>
  \`;
}

// Vulnerable to: user.name = "<script>alert('XSS')</script>"`,
      explanation: 'The good example uses context-appropriate encoding for different output contexts (HTML, JavaScript, URL). The bad example directly outputs user data without encoding, allowing XSS attacks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Broken Access Control Prevention',
      goodExample: `// Good: Proper authorization checks
class AuthorizationMiddleware {
  static requireRole(requiredRole) {
    return async (req, res, next) => {
      try {
        const user = await this.getCurrentUser(req);
        
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!this.hasRole(user, requiredRole)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        req.user = user;
        next();
      } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
      }
    };
  }
  
  static requireOwnership(resourceType) {
    return async (req, res, next) => {
      try {
        const user = await this.getCurrentUser(req);
        const resourceId = req.params.id;
        
        const resource = await this.getResource(resourceType, resourceId);
        
        if (!resource) {
          return res.status(404).json({ error: 'Resource not found' });
        }
        
        // Check if user owns the resource or is admin
        if (resource.userId !== user.id && !this.hasRole(user, 'admin')) {
          return res.status(403).json({ error: 'Access denied' });
        }
        
        req.resource = resource;
        next();
      } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
      }
    };
  }
  
  static hasRole(user, role) {
    return user.roles && user.roles.includes(role);
  }
}

// Usage
app.get('/admin/users', 
  AuthorizationMiddleware.requireRole('admin'), 
  (req, res) => {
    // Only admins can access this endpoint
  }
);

app.delete('/api/posts/:id', 
  AuthorizationMiddleware.requireOwnership('post'),
  (req, res) => {
    // Only post owner or admin can delete
  }
);`,
      badExample: `// Bad: No authorization checks
app.get('/admin/users', (req, res) => {
  // Anyone can access admin functionality
  const users = await User.findAll();
  res.json(users);
});

app.delete('/api/posts/:id', (req, res) => {
  // Anyone can delete any post
  await Post.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});`,
      explanation: 'The good example implements comprehensive authorization checks with role-based and ownership-based access control. The bad example has no authorization, allowing any user to access protected resources.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Secure Deserialization',
      goodExample: `// Good: Safe deserialization with validation
const Joi = require('joi');

class SecureDeserializer {
  constructor() {
    // Define allowed schemas for different data types
    this.schemas = {
      user: Joi.object({
        id: Joi.number().integer().positive().required(),
        name: Joi.string().max(100).required(),
        email: Joi.string().email().required(),
        role: Joi.string().valid('user', 'admin', 'moderator').required()
      }),
      
      post: Joi.object({
        title: Joi.string().max(200).required(),
        content: Joi.string().max(10000).required(),
        authorId: Joi.number().integer().positive().required(),
        tags: Joi.array().items(Joi.string().max(50)).max(10)
      })
    };
  }
  
  deserialize(jsonString, schemaName) {
    try {
      // Parse JSON safely
      const data = JSON.parse(jsonString);
      
      // Validate against schema
      const schema = this.schemas[schemaName];
      if (!schema) {
        throw new Error(\`Unknown schema: \${schemaName}\`);
      }
      
      const { error, value } = schema.validate(data, {
        stripUnknown: true, // Remove unknown properties
        abortEarly: false
      });
      
      if (error) {
        throw new Error(\`Validation failed: \${error.details.map(d => d.message).join(', ')}\`);
      }
      
      return value;
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw error;
    }
  }
  
  // Safe deserialization for specific types
  deserializeUser(jsonString) {
    return this.deserialize(jsonString, 'user');
  }
  
  deserializePost(jsonString) {
    return this.deserialize(jsonString, 'post');
  }
}

// Usage
const deserializer = new SecureDeserializer();

app.post('/api/users', (req, res) => {
  try {
    const userData = deserializer.deserializeUser(JSON.stringify(req.body));
    // Process validated data
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});`,
      badExample: `// Bad: Unsafe deserialization
app.post('/api/users', (req, res) => {
  // Direct deserialization without validation
  const userData = JSON.parse(req.body);
  
  // No validation - could contain malicious data
  const user = new User(userData);
  user.save();
});

// Even worse: Using eval or similar
function deserializeData(serializedData) {
  return eval(\`(\${serializedData})\`); // Extremely dangerous!
}`,
      explanation: 'The good example validates all deserialized data against predefined schemas and strips unknown properties. The bad example deserializes data without validation, potentially allowing malicious payloads.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Security Logging and Monitoring',
      goodExample: `// Good: Comprehensive security logging
const winston = require('winston');

class SecurityLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
      ]
    });
  }
  
  logAuthenticationAttempt(username, success, ip, userAgent) {
    this.logger.info('Authentication attempt', {
      event: 'auth_attempt',
      username: username,
      success: success,
      ip: ip,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    });
  }
  
  logAuthorizationFailure(userId, resource, action, ip) {
    this.logger.warn('Authorization failure', {
      event: 'auth_failure',
      userId: userId,
      resource: resource,
      action: action,
      ip: ip,
      timestamp: new Date().toISOString()
    });
  }
  
  logSuspiciousActivity(type, details, ip, userId = null) {
    this.logger.warn('Suspicious activity detected', {
      event: 'suspicious_activity',
      type: type,
      details: details,
      ip: ip,
      userId: userId,
      timestamp: new Date().toISOString()
    });
  }
  
  logDataAccess(userId, dataType, recordId, action) {
    this.logger.info('Data access', {
      event: 'data_access',
      userId: userId,
      dataType: dataType,
      recordId: recordId,
      action: action,
      timestamp: new Date().toISOString()
    });
  }
}

// Security monitoring middleware
const securityLogger = new SecurityLogger();

function securityMonitoring(req, res, next) {
  // Log all requests to sensitive endpoints
  if (req.path.startsWith('/admin') || req.path.startsWith('/api/sensitive')) {
    securityLogger.logDataAccess(
      req.user?.id,
      'sensitive_endpoint',
      req.path,
      req.method
    );
  }
  
  // Monitor for suspicious patterns
  const suspiciousPatterns = [
    /\\.\\.\\//, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i // JavaScript injection
  ];
  
  const requestData = JSON.stringify(req.body) + req.url;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      securityLogger.logSuspiciousActivity(
        'malicious_pattern',
        { pattern: pattern.toString(), data: requestData },
        req.ip,
        req.user?.id
      );
      break;
    }
  }
  
  next();
}

app.use(securityMonitoring);`,
      badExample: `// Bad: No security logging
app.post('/login', (req, res) => {
  const user = authenticateUser(req.body.username, req.body.password);
  if (user) {
    // No logging of successful login
    res.json({ success: true });
  } else {
    // No logging of failed login attempt
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/admin/users', (req, res) => {
  // No logging of admin access
  const users = await User.findAll();
  res.json(users);
});`,
      explanation: 'The good example implements comprehensive security logging for authentication, authorization, data access, and suspicious activities. The bad example has no security logging, making it impossible to detect or investigate security incidents.'
    })
  ],
  relatedGuidelines: [
    'security-input-validation',
    'security-authentication',
    'security-data-protection',
    'security-server-configuration'
  ]
});