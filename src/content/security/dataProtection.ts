import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';

/**
 * Data Protection and Privacy Guidelines
 * Define data protection standards and privacy compliance rules
 */

export const dataProtectionGuidelines = new GuidelineEntry({
  id: 'security-data-protection',
  title: 'Data Protection and Privacy',
  category: 'security',
  priority: 'critical',
  description: 'Comprehensive guidelines for protecting user data and ensuring privacy compliance including GDPR, data encryption, secure storage, and data minimization principles.',
  rules: [
    new Rule({
      statement: 'Encrypt sensitive data at rest and in transit',
      rationale: 'Encryption protects data from unauthorized access even if storage or transmission channels are compromised.',
      implementation: 'Use AES-256 for data at rest and TLS 1.3 for data in transit. Store encryption keys separately from encrypted data.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['encryption-checker']
      }
    }),

    new Rule({
      statement: 'Implement data minimization principles',
      rationale: 'Collecting only necessary data reduces privacy risks and compliance burden while limiting exposure in case of breaches.',
      implementation: 'Define data collection purposes, collect only required fields, and regularly purge unnecessary data.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['data-audit']
      }
    }),

    new Rule({
      statement: 'Provide user consent mechanisms for data processing',
      rationale: 'Legal compliance with privacy regulations requires explicit user consent for data collection and processing.',
      implementation: 'Implement granular consent options, maintain consent records, and allow consent withdrawal.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['consent-checker']
      }
    }),

    new Rule({
      statement: 'Implement secure data deletion and retention policies',
      rationale: 'Proper data lifecycle management reduces privacy risks and ensures compliance with data retention regulations.',
      implementation: 'Define retention periods, implement automated deletion, and ensure secure data wiping.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['data-deletion-checker']
      }
    }),

    new Rule({
      statement: 'Anonymize or pseudonymize personal data when possible',
      rationale: 'Anonymized data reduces privacy risks and may exempt certain processing from strict privacy regulations.',
      implementation: 'Remove or hash personally identifiable information while preserving data utility for analytics.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['anonymization-checker']
      }
    }),

    new Rule({
      statement: 'Implement data breach detection and response procedures',
      rationale: 'Early detection and proper response to data breaches minimizes damage and ensures regulatory compliance.',
      implementation: 'Monitor for unauthorized access, maintain incident response plans, and establish notification procedures.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['breach-response-checker']
      }
    })
  ],
  examples: [
    new CodeExample({
      language: 'javascript',
      title: 'Data Encryption at Rest',
      goodExample: `// Good: Encrypting sensitive data before storage
const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }
  
  encrypt(text, key) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encryptedData, key) {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      key, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Usage
const encryption = new DataEncryption();
const sensitiveData = "user@example.com";
const encryptionKey = process.env.ENCRYPTION_KEY;

const encrypted = encryption.encrypt(sensitiveData, encryptionKey);
// Store encrypted.encrypted, encrypted.iv, encrypted.tag in database`,
      badExample: `// Bad: Storing sensitive data in plain text
const user = {
  email: "user@example.com", // Plain text email
  ssn: "123-45-6789", // Plain text SSN
  creditCard: "4111-1111-1111-1111" // Plain text credit card
};

// Direct storage without encryption
await database.users.insert(user);`,
      explanation: 'The good example encrypts sensitive data using AES-256-GCM with proper IV and authentication tag. The bad example stores sensitive information in plain text, making it vulnerable if the database is compromised.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'GDPR Consent Management',
      goodExample: `// Good: Granular consent management
class ConsentManager {
  constructor() {
    this.consentTypes = {
      necessary: { required: true, description: 'Essential for website functionality' },
      analytics: { required: false, description: 'Help us improve our website' },
      marketing: { required: false, description: 'Personalized advertisements' },
      social: { required: false, description: 'Social media integration' }
    };
  }
  
  async recordConsent(userId, consents) {
    const consentRecord = {
      userId,
      consents,
      timestamp: new Date(),
      ipAddress: this.hashIP(req.ip), // Hash IP for privacy
      userAgent: req.get('User-Agent'),
      version: '1.0' // Consent form version
    };
    
    await this.database.consents.insert(consentRecord);
    return consentRecord;
  }
  
  async withdrawConsent(userId, consentType) {
    await this.database.consents.update(
      { userId },
      { 
        [\`consents.\${consentType}\`]: false,
        withdrawnAt: new Date()
      }
    );
    
    // Trigger data deletion for withdrawn consent
    await this.deleteDataForConsentType(userId, consentType);
  }
  
  async getConsentStatus(userId) {
    const consent = await this.database.consents.findOne({ userId });
    return consent ? consent.consents : {};
  }
  
  hashIP(ip) {
    return crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex');
  }
}`,
      badExample: `// Bad: No consent management
// Automatically collect all data without consent
const userData = {
  email: req.body.email,
  analytics: true, // Assumed consent
  marketing: true, // Assumed consent
  location: req.ip // Store raw IP
};`,
      explanation: 'The good example implements granular consent management with proper record keeping, withdrawal mechanisms, and IP hashing. The bad example assumes consent and stores raw personal data.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Data Anonymization',
      goodExample: `// Good: Proper data anonymization for analytics
class DataAnonymizer {
  anonymizeUser(user) {
    return {
      id: this.generateAnonymousId(user.id),
      ageGroup: this.getAgeGroup(user.age), // 25-34 instead of exact age
      location: this.getRegion(user.zipCode), // Region instead of exact location
      registrationMonth: this.getMonth(user.registrationDate),
      activityLevel: this.categorizeActivity(user.loginCount),
      // Remove all directly identifying information
    };
  }
  
  generateAnonymousId(originalId) {
    return crypto.createHash('sha256')
      .update(originalId + process.env.ANONYMIZATION_SALT)
      .digest('hex')
      .substring(0, 16);
  }
  
  getAgeGroup(age) {
    if (age < 18) return 'under-18';
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    return '55+';
  }
  
  getRegion(zipCode) {
    // Convert zip code to broader region
    const firstDigit = zipCode.toString().charAt(0);
    const regions = {
      '0': 'Northeast', '1': 'Northeast',
      '2': 'Southeast', '3': 'Southeast',
      '4': 'Midwest', '5': 'Midwest',
      '6': 'South', '7': 'South',
      '8': 'West', '9': 'West'
    };
    return regions[firstDigit] || 'Unknown';
  }
}`,
      badExample: `// Bad: Using personal data directly for analytics
const analyticsData = {
  userId: user.id,
  email: user.email, // Personally identifiable
  fullName: user.name, // Personally identifiable
  exactAge: user.age,
  fullAddress: user.address, // Highly sensitive
  phoneNumber: user.phone // Personally identifiable
};`,
      explanation: 'The good example anonymizes data by removing direct identifiers and generalizing specific information while preserving analytical value. The bad example uses personal data directly, creating privacy risks.'
    }),

    new CodeExample({
      language: 'javascript',
      title: 'Secure Data Deletion',
      goodExample: `// Good: Secure data deletion with verification
class SecureDataDeletion {
  async deleteUserData(userId, reason = 'user_request') {
    const deletionLog = {
      userId,
      reason,
      timestamp: new Date(),
      deletedTables: []
    };
    
    try {
      // Delete from all related tables
      const tables = ['users', 'user_profiles', 'user_preferences', 'user_sessions'];
      
      for (const table of tables) {
        const result = await this.database[table].deleteMany({ userId });
        deletionLog.deletedTables.push({
          table,
          recordsDeleted: result.deletedCount
        });
      }
      
      // Delete uploaded files
      await this.deleteUserFiles(userId);
      
      // Remove from search indexes
      await this.removeFromSearchIndex(userId);
      
      // Log the deletion for audit purposes
      await this.database.deletion_logs.insert(deletionLog);
      
      // Verify deletion completed
      await this.verifyDeletion(userId);
      
      return { success: true, deletionLog };
      
    } catch (error) {
      // Log failed deletion attempt
      deletionLog.error = error.message;
      await this.database.deletion_logs.insert(deletionLog);
      throw error;
    }
  }
  
  async verifyDeletion(userId) {
    const tables = ['users', 'user_profiles', 'user_preferences'];
    
    for (const table of tables) {
      const remaining = await this.database[table].countDocuments({ userId });
      if (remaining > 0) {
        throw new Error(\`Deletion verification failed: \${remaining} records remain in \${table}\`);
      }
    }
  }
  
  async scheduleAutomaticDeletion(retentionPeriodDays = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodDays);
    
    const inactiveUsers = await this.database.users.find({
      lastLoginDate: { $lt: cutoffDate },
      deletionScheduled: { $ne: true }
    });
    
    for (const user of inactiveUsers) {
      await this.scheduleUserDeletion(user.id, 'retention_policy');
    }
  }
}`,
      badExample: `// Bad: Incomplete data deletion
async function deleteUser(userId) {
  // Only deletes from main users table
  await database.users.deleteOne({ id: userId });
  // Leaves data in related tables, files, logs, etc.
}`,
      explanation: 'The good example implements comprehensive data deletion across all related tables, files, and indexes with verification and audit logging. The bad example only deletes from one table, leaving personal data scattered across the system.'
    })
  ],
  relatedGuidelines: [
    'security-input-validation',
    'security-authentication',
    'security-server-configuration'
  ]
});