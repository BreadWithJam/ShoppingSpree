import { GuidelineEntry } from '../../types';

/**
 * Deployment Validation Guidelines
 * Pre-deployment validation and quality assurance procedures
 */

export const deploymentValidationGuidelines: GuidelineEntry = {
  id: 'testing-deployment-validation',
  title: 'Deployment Validation Guidelines',
  category: 'testing',
  priority: 'critical',
  description: 'Comprehensive guidelines for pre-deployment validation and quality assurance to ensure websites are production-ready and meet all requirements before going live.',
  rules: [
    {
      statement: 'Run comprehensive test suite before every deployment',
      rationale: 'A complete test run catches regressions and ensures all functionality works correctly before users encounter issues.',
      implementation: 'Execute unit tests, integration tests, and end-to-end tests as part of the deployment pipeline.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['ci-cd-pipeline', 'test-runner']
      }
    },

    {
      statement: 'Validate all environment configurations and secrets',
      rationale: 'Incorrect environment variables or missing secrets can cause application failures or security vulnerabilities in production.',
      implementation: 'Check that all required environment variables are set, secrets are properly configured, and database connections work.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['config-validator', 'secret-checker']
      }
    },

    {
      statement: 'Perform security scanning and vulnerability assessment',
      rationale: 'Security vulnerabilities in dependencies or code can expose the application to attacks and data breaches.',
      implementation: 'Run dependency vulnerability scans, static code analysis, and security audits before deployment.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['npm-audit', 'snyk', 'sonarqube']
      }
    },

    {
      statement: 'Verify performance benchmarks and resource limits',
      rationale: 'Performance regressions can negatively impact user experience and may indicate underlying issues.',
      implementation: 'Run performance tests, check bundle sizes, and validate that resource usage stays within acceptable limits.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['lighthouse', 'bundle-analyzer', 'performance-monitor']
      }
    },

    {
      statement: 'Test database migrations and data integrity',
      rationale: 'Database migration failures can cause data loss or application downtime in production environments.',
      implementation: 'Run database migrations in staging environment, verify data integrity, and test rollback procedures.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['migration-tester', 'data-validator']
      }
    },

    {
      statement: 'Validate SSL certificates and HTTPS configuration',
      rationale: 'SSL certificate issues can make the website inaccessible and compromise security.',
      implementation: 'Check SSL certificate validity, expiration dates, and proper HTTPS redirects.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['ssl-checker', 'https-validator']
      }
    },

    {
      statement: 'Implement deployment rollback procedures and health checks',
      rationale: 'Quick rollback capability minimizes downtime when deployment issues are discovered after going live.',
      implementation: 'Set up automated health checks, monitoring alerts, and one-click rollback procedures.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['health-checker', 'monitoring-system']
      }
    },

    {
      statement: 'Verify content delivery network (CDN) and caching configuration',
      rationale: 'Incorrect CDN or caching setup can cause stale content delivery or performance issues.',
      implementation: 'Test CDN endpoints, verify cache headers, and ensure proper cache invalidation procedures.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['cdn-tester', 'cache-validator']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Pre-Deployment Validation Script',
      goodExample: `// Good: Comprehensive pre-deployment validation
// scripts/pre-deploy-validation.js
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

class DeploymentValidator {
  constructor(config) {
    this.config = config;
    this.errors = [];
    this.warnings = [];
  }

  async validateAll() {
    console.log('🚀 Starting pre-deployment validation...');
    
    await this.runTests();
    await this.validateEnvironment();
    await this.checkSecurity();
    await this.validatePerformance();
    await this.checkDatabaseMigrations();
    await this.validateSSL();
    await this.checkHealthEndpoints();
    
    this.reportResults();
    
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  async runTests() {
    console.log('📋 Running test suite...');
    try {
      execSync('npm run test:all', { stdio: 'inherit' });
      console.log('✅ All tests passed');
    } catch (error) {
      this.errors.push('Test suite failed');
    }
  }

  async validateEnvironment() {
    console.log('🔧 Validating environment configuration...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'API_KEY',
      'JWT_SECRET',
      'REDIS_URL'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.errors.push(\`Missing required environment variable: \${envVar}\`);
      }
    }
    
    // Test database connection
    try {
      const db = require('../lib/database');
      await db.testConnection();
      console.log('✅ Database connection successful');
    } catch (error) {
      this.errors.push(\`Database connection failed: \${error.message}\`);
    }
  }

  async checkSecurity() {
    console.log('🔒 Running security checks...');
    
    try {
      // Run npm audit
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
      console.log('✅ No security vulnerabilities found');
    } catch (error) {
      this.errors.push('Security vulnerabilities detected in dependencies');
    }
    
    // Check for exposed secrets
    try {
      execSync('git secrets --scan', { stdio: 'pipe' });
      console.log('✅ No secrets exposed in code');
    } catch (error) {
      this.errors.push('Potential secrets found in code');
    }
  }

  async validatePerformance() {
    console.log('⚡ Validating performance...');
    
    try {
      // Check bundle size
      const bundleStats = JSON.parse(fs.readFileSync('dist/bundle-stats.json'));
      const maxBundleSize = 500 * 1024; // 500KB
      
      if (bundleStats.totalSize > maxBundleSize) {
        this.warnings.push(\`Bundle size (\${bundleStats.totalSize}B) exceeds recommended limit (\${maxBundleSize}B)\`);
      }
      
      // Run Lighthouse CI
      execSync('lhci autorun', { stdio: 'inherit' });
      console.log('✅ Performance benchmarks met');
    } catch (error) {
      this.errors.push('Performance validation failed');
    }
  }

  async checkDatabaseMigrations() {
    console.log('🗄️ Checking database migrations...');
    
    try {
      // Run migrations in dry-run mode
      execSync('npm run db:migrate:dry-run', { stdio: 'pipe' });
      console.log('✅ Database migrations validated');
    } catch (error) {
      this.errors.push('Database migration validation failed');
    }
  }

  async validateSSL() {
    console.log('🔐 Validating SSL configuration...');
    
    const domain = this.config.domain;
    
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        path: '/',
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        const now = new Date();
        const expiry = new Date(cert.valid_to);
        const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 30) {
          this.warnings.push(\`SSL certificate expires in \${daysUntilExpiry} days\`);
        }
        
        console.log('✅ SSL certificate is valid');
        resolve();
      });
      
      req.on('error', (error) => {
        this.errors.push(\`SSL validation failed: \${error.message}\`);
        resolve();
      });
      
      req.end();
    });
  }

  async checkHealthEndpoints() {
    console.log('🏥 Checking health endpoints...');
    
    const healthEndpoints = [
      '/health',
      '/api/health',
      '/status'
    ];
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await fetch(\`\${this.config.baseUrl}\${endpoint}\`);
        if (response.ok) {
          console.log(\`✅ Health endpoint \${endpoint} is responding\`);
        } else {
          this.warnings.push(\`Health endpoint \${endpoint} returned status \${response.status}\`);
        }
      } catch (error) {
        this.warnings.push(\`Health endpoint \${endpoint} is not accessible\`);
      }
    }
  }

  reportResults() {
    console.log('\\n📊 Validation Results:');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All validations passed! Ready for deployment.');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log('\\n❌ Errors (must be fixed before deployment):');
      this.errors.forEach(error => console.log(\`  - \${error}\`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\\n⚠️  Warnings (should be addressed):');
      this.warnings.forEach(warning => console.log(\`  - \${warning}\`));
    }
  }
}

// Usage
const config = {
  domain: process.env.DOMAIN || 'example.com',
  baseUrl: process.env.BASE_URL || 'https://staging.example.com'
};

const validator = new DeploymentValidator(config);
validator.validateAll().catch(console.error);`,
      badExample: `// Bad: No pre-deployment validation
// deploy.js
const { execSync } = require('child_process');

// Deploy without any validation
execSync('git push origin main');
console.log('Deployed!');`,
      explanation: 'The good example implements comprehensive pre-deployment validation including tests, security checks, performance validation, and environment verification. The bad example deploys without any validation, risking production issues.'
    },

    {
      language: 'javascript',
      title: 'CI/CD Pipeline with Deployment Gates',
      goodExample: `# Good: GitHub Actions workflow with deployment validation
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    outputs:
      deploy-ready: \${{ steps.validation.outputs.ready }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:all
    
    - name: Security audit
      run: npm audit --audit-level moderate
    
    - name: Build application
      run: npm run build
    
    - name: Performance audit
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: \${{ secrets.LHCI_GITHUB_APP_TOKEN }}
    
    - name: Bundle size check
      run: npm run analyze:bundle
    
    - name: Validate environment
      id: validation
      run: |
        node scripts/validate-environment.js
        echo "ready=true" >> $GITHUB_OUTPUT
      env:
        DATABASE_URL: \${{ secrets.DATABASE_URL }}
        API_KEY: \${{ secrets.API_KEY }}

  deploy-staging:
    needs: validate
    if: needs.validate.outputs.deploy-ready == 'true'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging..."
        # Deploy to staging environment
    
    - name: Run smoke tests
      run: |
        npm run test:smoke -- --env=staging
      env:
        STAGING_URL: \${{ secrets.STAGING_URL }}
    
    - name: Performance test
      run: |
        npm run test:performance -- --env=staging

  deploy-production:
    needs: [validate, deploy-staging]
    if: success()
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Deploy to production environment
    
    - name: Health check
      run: |
        sleep 30  # Wait for deployment to complete
        curl -f \${{ secrets.PRODUCTION_URL }}/health
    
    - name: Notify team
      if: success()
      run: |
        curl -X POST \${{ secrets.SLACK_WEBHOOK }} \\
          -H 'Content-type: application/json' \\
          --data '{"text":"🚀 Production deployment successful!"}'
    
    - name: Rollback on failure
      if: failure()
      run: |
        echo "Deployment failed, initiating rollback..."
        # Rollback procedure
        curl -X POST \${{ secrets.SLACK_WEBHOOK }} \\
          -H 'Content-type: application/json' \\
          --data '{"text":"❌ Production deployment failed, rollback initiated"}'`,
      badExample: `# Bad: Direct deployment without validation
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy
      run: |
        npm install
        npm run build
        # Deploy without any validation`,
      explanation: 'The good example implements deployment gates with comprehensive validation, staging deployment, smoke tests, and rollback procedures. The bad example deploys directly without any validation or safety measures.'
    },

    {
      language: 'javascript',
      title: 'Health Check and Monitoring Setup',
      goodExample: `// Good: Comprehensive health check implementation
// routes/health.js
const express = require('express');
const router = express.Router();

class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.registerDefaultChecks();
  }

  registerDefaultChecks() {
    this.checks.set('database', this.checkDatabase);
    this.checks.set('redis', this.checkRedis);
    this.checks.set('external-api', this.checkExternalAPI);
    this.checks.set('disk-space', this.checkDiskSpace);
    this.checks.set('memory', this.checkMemory);
  }

  async checkDatabase() {
    try {
      const db = require('../lib/database');
      await db.query('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkRedis() {
    try {
      const redis = require('../lib/redis');
      await redis.ping();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkExternalAPI() {
    try {
      const response = await fetch('https://api.external-service.com/health', {
        timeout: 5000
      });
      
      if (response.ok) {
        return { status: 'healthy', responseTime: response.headers.get('x-response-time') };
      } else {
        return { status: 'degraded', statusCode: response.status };
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkDiskSpace() {
    const fs = require('fs');
    const stats = fs.statSync('/');
    const freeSpace = stats.free / stats.size;
    
    if (freeSpace < 0.1) {
      return { status: 'unhealthy', freeSpace: \`\${(freeSpace * 100).toFixed(2)}%\` };
    } else if (freeSpace < 0.2) {
      return { status: 'degraded', freeSpace: \`\${(freeSpace * 100).toFixed(2)}%\` };
    } else {
      return { status: 'healthy', freeSpace: \`\${(freeSpace * 100).toFixed(2)}%\` };
    }
  }

  async checkMemory() {
    const used = process.memoryUsage();
    const total = require('os').totalmem();
    const usage = used.heapUsed / total;
    
    if (usage > 0.9) {
      return { status: 'unhealthy', memoryUsage: \`\${(usage * 100).toFixed(2)}%\` };
    } else if (usage > 0.8) {
      return { status: 'degraded', memoryUsage: \`\${(usage * 100).toFixed(2)}%\` };
    } else {
      return { status: 'healthy', memoryUsage: \`\${(usage * 100).toFixed(2)}%\` };
    }
  }

  async runAllChecks() {
    const results = {};
    let overallStatus = 'healthy';

    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn.call(this);
        results[name] = result;
        
        if (result.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        results[name] = { status: 'unhealthy', error: error.message };
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown',
      uptime: process.uptime(),
      checks: results
    };
  }
}

const healthChecker = new HealthChecker();

// Health check endpoints
router.get('/health', async (req, res) => {
  const health = await healthChecker.runAllChecks();
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

router.get('/health/live', (req, res) => {
  // Liveness probe - just check if the app is running
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (req, res) => {
  // Readiness probe - check if app is ready to serve traffic
  try {
    await healthChecker.checkDatabase();
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

module.exports = router;

// Monitoring and alerting setup
// monitoring/alerts.js
const healthChecker = require('../routes/health');

setInterval(async () => {
  const health = await healthChecker.runAllChecks();
  
  if (health.status === 'unhealthy') {
    // Send alert to monitoring system
    await sendAlert({
      severity: 'critical',
      message: 'Application health check failed',
      details: health
    });
  } else if (health.status === 'degraded') {
    await sendAlert({
      severity: 'warning',
      message: 'Application performance degraded',
      details: health
    });
  }
}, 60000); // Check every minute`,
      badExample: `// Bad: Basic health check without comprehensive monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});`,
      explanation: 'The good example implements comprehensive health checks for all system dependencies, provides different probe types for Kubernetes, and includes monitoring and alerting. The bad example only provides a basic status without checking actual system health.'
    }
  ],
  relatedGuidelines: [
    'testing-strategy',
    'testing-automated',
    'security-server-configuration',
    'performance-monitoring'
  ]
};