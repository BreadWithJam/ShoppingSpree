import { GuidelineEntry } from '../../types';
import { CodeExample } from '../../models/CodeExample';

/**
 * Input Validation and Sanitization Guidelines
 * Comprehensive rules for input validation across different contexts
 */

export const inputValidationGuidelines: GuidelineEntry = {
  id: 'security-input-validation',
  title: 'Input Validation and Sanitization',
  category: 'security',
  priority: 'critical',
  description: 'Comprehensive guidelines for validating and sanitizing user input to prevent security vulnerabilities including injection attacks, XSS, and data corruption.',
  rules: [
    {
      statement: 'All user input must be validated on both client and server sides',
      rationale: 'Client-side validation can be bypassed, so server-side validation is essential for security. Client-side validation improves user experience.',
      implementation: 'Implement validation functions that check input format, length, type, and allowed characters before processing.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['validation-functions-checker']
      }
    },

    {
      statement: 'Use whitelist validation instead of blacklist validation',
      rationale: 'Whitelisting defines what is allowed, making it harder for attackers to find bypasses compared to blacklisting what is forbidden.',
      implementation: 'Define allowed characters, patterns, and formats explicitly. Reject anything that does not match the whitelist.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['manual-review']
      }
    },

    {
      statement: 'Sanitize input data before storage or display',
      rationale: 'Sanitization removes or encodes potentially dangerous characters to prevent injection attacks and XSS.',
      implementation: 'Use established sanitization libraries and encode output based on context (HTML, URL, JavaScript, SQL).',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['sanitization-checker']
      }
    },

    {
      statement: 'Validate input length and size limits',
      rationale: 'Prevents buffer overflow attacks, denial of service through large payloads, and ensures data fits storage constraints.',
      implementation: 'Set maximum length limits for all input fields and validate file upload sizes.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['length-validator']
      }
    },

    {
      statement: 'Use parameterized queries for database operations',
      rationale: 'Parameterized queries prevent SQL injection by separating SQL code from data.',
      implementation: 'Use prepared statements or ORM methods that automatically handle parameter binding.',
      validation: {
        method: 'static-analysis',
        automated: true,
        tools: ['sql-injection-scanner']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Client-side Input Validation',
      goodExample: `// Good: Comprehensive validation with whitelist approach
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  const maxLength = 254;
  
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (email.length > maxLength) {
    return { valid: false, error: 'Email too long' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}`,
      badExample: `// Bad: Insufficient validation
function validateEmail(email) {
  if (email.includes('@')) {
    return true;
  }
  return false;
}`,
      explanation: 'The good example uses whitelist validation with regex, checks data type, enforces length limits, and provides meaningful error messages. The bad example only checks for @ symbol presence.'
    },

    {
      language: 'javascript',
      title: 'HTML Sanitization for XSS Prevention',
      goodExample: `// Good: Proper HTML sanitization
import DOMPurify from 'dompurify';

function sanitizeHTML(userInput) {
  // Configure DOMPurify to be strict
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  };
  
  return DOMPurify.sanitize(userInput, config);
}

// Usage
const userComment = "<script>alert('xss')</script><p>Safe content</p>";
const safeHTML = sanitizeHTML(userComment); // Returns: "<p>Safe content</p>"`,
      badExample: `// Bad: No sanitization
function displayUserContent(userInput) {
  document.getElementById('content').innerHTML = userInput; // XSS vulnerability
}`,
      explanation: 'The good example uses a trusted sanitization library with strict configuration to remove dangerous elements while preserving safe content. The bad example directly inserts user input into DOM.'
    },

    {
      language: 'javascript',
      title: 'Parameterized Database Queries',
      goodExample: `// Good: Parameterized query prevents SQL injection
async function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const result = await db.execute(query, [userId]);
  return result;
}

// Using ORM (Sequelize example)
async function findUserByEmail(email) {
  return await User.findOne({
    where: { email: email } // Automatically parameterized
  });
}`,
      badExample: `// Bad: String concatenation creates SQL injection vulnerability
async function getUserById(userId) {
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  const result = await db.execute(query);
  return result;
}`,
      explanation: 'The good examples use parameterized queries that separate SQL code from data, preventing injection attacks. The bad example concatenates user input directly into the SQL string.'
    },

    {
      language: 'javascript',
      title: 'File Upload Validation',
      goodExample: `// Good: Comprehensive file upload validation
function validateFileUpload(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }
  
  return { valid: true };
}`,
      badExample: `// Bad: Only checks file extension
function validateFileUpload(file) {
  return file.name.endsWith('.jpg') || file.name.endsWith('.png');
}`,
      explanation: 'The good example validates multiple aspects: file size, MIME type, and extension using whitelists. The bad example only checks extension, which can be easily spoofed.'
    }
  ],
  relatedGuidelines: [
    'security-authentication',
    'security-data-protection',
    'security-owasp-prevention'
  ]
};