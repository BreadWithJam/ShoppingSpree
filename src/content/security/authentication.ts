import { GuidelineEntry } from '../../types';
import { CodeExample } from '../../models/CodeExample';

/**
 * Authentication and Authorization Guidelines
 * Secure password handling and session management rules
 */

export const authenticationGuidelines: GuidelineEntry = {
  id: 'security-authentication',
  title: 'Authentication and Authorization',
  category: 'security',
  priority: 'critical',
  description: 'Comprehensive guidelines for implementing secure authentication and authorization systems, including password handling, session management, and access control.',
  rules: [
    {
      statement: 'Use strong password hashing with salt',
      rationale: 'Plain text or weakly hashed passwords can be easily compromised. Strong hashing with salt prevents rainbow table attacks.',
      implementation: 'Use bcrypt, scrypt, or Argon2 with appropriate cost factors. Generate unique salts for each password.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['password-hash-checker']
      }
    },

    {
      statement: 'Implement secure session management',
      rationale: 'Insecure sessions can lead to session hijacking, fixation attacks, and unauthorized access.',
      implementation: 'Use secure, httpOnly, sameSite cookies. Implement session timeout and regenerate session IDs after login.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['session-config-checker']
      }
    },

    {
      statement: 'Enforce strong password policies',
      rationale: 'Weak passwords are easily compromised through brute force or dictionary attacks.',
      implementation: 'Require minimum length, character complexity, and check against common password lists.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['password-policy-validator']
      }
    },

    {
      statement: 'Implement multi-factor authentication for sensitive operations',
      rationale: 'MFA provides additional security layer beyond passwords, significantly reducing account compromise risk.',
      implementation: 'Use TOTP, SMS, or hardware tokens for critical actions like password changes or financial transactions.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['mfa-checker']
      }
    },

    {
      statement: 'Use role-based access control (RBAC)',
      rationale: 'RBAC ensures users only access resources appropriate to their role, following principle of least privilege.',
      implementation: 'Define roles with specific permissions. Check user roles before granting access to resources or operations.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['rbac-checker']
      }
    },

    {
      statement: 'Implement account lockout protection',
      rationale: 'Prevents brute force attacks by temporarily locking accounts after failed login attempts.',
      implementation: 'Lock accounts after 3-5 failed attempts. Use progressive delays or CAPTCHA challenges.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['lockout-mechanism-checker']
      }
    }
  ],
  examples: [
    new CodeExample({
      language: 'javascript',
      title: 'Secure Password Hashing',
      goodExample: `// Good: Using bcrypt with proper salt rounds
const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
  const saltRounds = 12; // Adjust based on security requirements
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    return false;
  }
}`,
      badExample: `// Bad: Using weak hashing without salt
const crypto = require('crypto');

function hashPassword(plainPassword) {
  return crypto.createHash('md5').update(plainPassword).digest('hex');
}`,
      explanation: 'The good example uses bcrypt with appropriate salt rounds for secure password hashing. The bad example uses MD5 without salt, which is vulnerable to rainbow table attacks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Secure Session Configuration',
      goodExample: `// Good: Secure session configuration
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET, // Use environment variable
  name: 'sessionId', // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access to cookies
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: 'strict' // CSRF protection
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));

// Regenerate session ID after login
app.post('/login', async (req, res) => {
  // ... authentication logic ...
  if (authenticated) {
    req.session.regenerate((err) => {
      if (err) throw err;
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  }
});`,
      badExample: `// Bad: Insecure session configuration
app.use(session({
  secret: 'hardcoded-secret',
  cookie: {
    secure: false,
    httpOnly: false
  }
}));`,
      explanation: 'The good example uses secure session configuration with proper cookie flags, session regeneration, and environment-based secrets. The bad example has hardcoded secrets and insecure cookie settings.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Password Policy Validation',
      goodExample: `// Good: Comprehensive password validation
function validatePassword(password) {
  const minLength = 12;
  const maxLength = 128;
  const commonPasswords = ['password', '123456', 'qwerty', 'admin']; // Load from file
  
  const errors = [];
  
  // Length check
  if (password.length < minLength) {
    errors.push(\`Password must be at least \${minLength} characters long\`);
  }
  
  if (password.length > maxLength) {
    errors.push(\`Password must not exceed \${maxLength} characters\`);
  }
  
  // Complexity checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common password check
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}`,
      badExample: `// Bad: Weak password validation
function validatePassword(password) {
  return password.length >= 6;
}`,
      explanation: 'The good example enforces comprehensive password policies including length, complexity, and common password checks. The bad example only checks minimum length.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Role-Based Access Control',
      goodExample: `// Good: RBAC implementation
const roles = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  viewer: ['read']
};

function hasPermission(userRole, requiredPermission) {
  const userPermissions = roles[userRole] || [];
  return userPermissions.includes(requiredPermission);
}

// Middleware for route protection
function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.session.userRole;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.delete('/api/users/:id', requirePermission('manage_users'), (req, res) => {
  // Only admins can delete users
});`,
      badExample: `// Bad: No access control
app.delete('/api/users/:id', (req, res) => {
  // Anyone can delete users
});`,
      explanation: 'The good example implements RBAC with permission checking middleware. The bad example has no access control, allowing any authenticated user to perform sensitive operations.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Account Lockout Protection',
      goodExample: `// Good: Account lockout with progressive delays
const loginAttempts = new Map(); // In production, use Redis or database

async function attemptLogin(username, password) {
  const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  
  // Check if account is locked
  if (attempts.count >= 5) {
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    if (now - attempts.lastAttempt < lockoutTime) {
      throw new Error('Account temporarily locked due to too many failed attempts');
    } else {
      // Reset attempts after lockout period
      attempts.count = 0;
    }
  }
  
  // Verify credentials
  const user = await authenticateUser(username, password);
  
  if (user) {
    // Successful login - reset attempts
    loginAttempts.delete(username);
    return user;
  } else {
    // Failed login - increment attempts
    attempts.count++;
    attempts.lastAttempt = now;
    loginAttempts.set(username, attempts);
    
    throw new Error('Invalid credentials');
  }
}`,
      badExample: `// Bad: No lockout protection
async function attemptLogin(username, password) {
  const user = await authenticateUser(username, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  return user;
}`,
      explanation: 'The good example implements account lockout with progressive delays to prevent brute force attacks. The bad example has no protection against repeated login attempts.'
    })
  ],
  relatedGuidelines: [
    'security-input-validation',
    'security-data-protection',
    'security-server-configuration'
  ]
};