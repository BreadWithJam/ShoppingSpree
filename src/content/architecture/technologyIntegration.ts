import { GuidelineEntry } from '../../types';

/**
 * Technology Integration Guidelines
 * Define integration and compatibility requirements for multiple technologies
 */

export const technologyIntegrationGuidelines: GuidelineEntry = {
  id: 'architecture-technology-integration',
  title: 'Technology Integration Guidelines',
  category: 'architecture',
  priority: 'critical',
  description: 'Comprehensive guidelines for integrating multiple technologies, ensuring compatibility, maintainability, and seamless interoperability between different systems and frameworks.',
  rules: [
    {
      statement: 'Define clear integration boundaries and contracts',
      rationale: 'Clear boundaries prevent tight coupling between technologies and make it easier to replace or upgrade individual components without affecting the entire system.',
      implementation: 'Use well-defined APIs, interfaces, and data contracts. Implement adapter patterns for external services and maintain consistent data formats across boundaries.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['api-contract-validator']
      }
    },

    {
      statement: 'Implement technology-agnostic data layers',
      rationale: 'Technology-agnostic data layers allow different parts of the system to evolve independently and make it easier to migrate between technologies.',
      implementation: 'Use standardized data formats (JSON, GraphQL schemas), implement repository patterns, and avoid technology-specific data structures in shared interfaces.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['data-format-validator']
      }
    },

    {
      statement: 'Establish consistent error handling across technologies',
      rationale: 'Consistent error handling provides predictable behavior and makes debugging easier when multiple technologies are involved.',
      implementation: 'Define standard error formats, implement error translation layers, and use consistent HTTP status codes and error messages across all services.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['error-format-checker']
      }
    },

    {
      statement: 'Use standardized authentication and authorization',
      rationale: 'Standardized auth mechanisms ensure security consistency and simplify user experience across different technology stacks.',
      implementation: 'Implement OAuth 2.0, JWT tokens, or similar standards. Use centralized identity providers and consistent permission models across all services.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['auth-standard-checker']
      }
    },

    {
      statement: 'Implement comprehensive logging and monitoring',
      rationale: 'Unified logging and monitoring across technologies enables effective debugging, performance tracking, and system health monitoring.',
      implementation: 'Use structured logging formats, implement distributed tracing, and ensure all technologies contribute to centralized monitoring systems.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['logging-format-validator']
      }
    },

    {
      statement: 'Design for graceful degradation',
      rationale: 'Graceful degradation ensures the system continues to function even when some integrated technologies fail or become unavailable.',
      implementation: 'Implement circuit breakers, fallback mechanisms, and timeout handling. Design core functionality to work independently of optional integrations.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['resilience-tester']
      }
    },

    {
      statement: 'Maintain version compatibility strategies',
      rationale: 'Version compatibility strategies prevent breaking changes from disrupting the entire system and enable gradual technology upgrades.',
      implementation: 'Use semantic versioning, implement API versioning, and maintain backward compatibility. Plan migration strategies for major version changes.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['version-compatibility-checker']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Technology Integration with Adapter Pattern',
      goodExample: `// Good: Clean integration boundaries with adapter pattern
// Define technology-agnostic interfaces
interface PaymentProvider {
  processPayment(amount: number, currency: string, paymentMethod: PaymentMethod): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}

interface PaymentMethod {
  type: 'card' | 'bank' | 'wallet';
  details: Record<string, any>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  message?: string;
  errorCode?: string;
}

// Stripe adapter
class StripeAdapter implements PaymentProvider {
  constructor(private stripeClient: Stripe) {}

  async processPayment(amount: number, currency: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: amount * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        payment_method: this.convertPaymentMethod(paymentMethod),
        confirm: true
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        message: paymentIntent.status === 'succeeded' ? 'Payment successful' : 'Payment failed'
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        message: error.message,
        errorCode: error.code
      };
    }
  }

  private convertPaymentMethod(method: PaymentMethod): string {
    // Convert our standard format to Stripe format
    switch (method.type) {
      case 'card':
        return method.details.stripePaymentMethodId;
      default:
        throw new Error(\`Unsupported payment method: \${method.type}\`);
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      const refund = await this.stripeClient.refunds.create({
        payment_intent: transactionId,
        amount: amount ? amount * 100 : undefined
      });

      return {
        success: refund.status === 'succeeded',
        refundId: refund.id,
        amount: refund.amount / 100
      };
    } catch (error) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        message: error.message
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    const paymentIntent = await this.stripeClient.paymentIntents.retrieve(transactionId);
    return {
      id: paymentIntent.id,
      status: this.mapStripeStatus(paymentIntent.status),
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase()
    };
  }

  private mapStripeStatus(stripeStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    const statusMap = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'processing': 'pending',
      'succeeded': 'completed',
      'requires_action': 'pending',
      'canceled': 'cancelled',
      'payment_failed': 'failed'
    };
    return statusMap[stripeStatus] || 'failed';
  }
}

// PayPal adapter
class PayPalAdapter implements PaymentProvider {
  constructor(private paypalClient: PayPalClient) {}

  async processPayment(amount: number, currency: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      const order = await this.paypalClient.orders.create({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          }
        }],
        payment_source: this.convertPaymentMethod(paymentMethod)
      });

      const capture = await this.paypalClient.orders.capture(order.id);

      return {
        success: capture.status === 'COMPLETED',
        transactionId: capture.id,
        message: capture.status === 'COMPLETED' ? 'Payment successful' : 'Payment failed'
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        message: error.message,
        errorCode: error.name
      };
    }
  }

  private convertPaymentMethod(method: PaymentMethod): any {
    // Convert our standard format to PayPal format
    switch (method.type) {
      case 'card':
        return {
          card: {
            number: method.details.number,
            expiry: method.details.expiry,
            security_code: method.details.cvv
          }
        };
      default:
        throw new Error(\`Unsupported payment method: \${method.type}\`);
    }
  }

  // ... implement other methods
}

// Payment service that uses adapters
class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  registerProvider(name: string, provider: PaymentProvider) {
    this.providers.set(name, provider);
  }

  async processPayment(
    providerName: string, 
    amount: number, 
    currency: string, 
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(\`Payment provider '\${providerName}' not found\`);
    }

    return provider.processPayment(amount, currency, paymentMethod);
  }
}

// Usage
const paymentService = new PaymentService();
paymentService.registerProvider('stripe', new StripeAdapter(stripeClient));
paymentService.registerProvider('paypal', new PayPalAdapter(paypalClient));`,
      badExample: `// Bad: Tight coupling between technologies
// Direct Stripe integration mixed with business logic
class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.paypal = new PayPalClient(process.env.PAYPAL_CLIENT_ID);
  }

  async processPayment(provider: string, amount: number, currency: string, cardDetails: any) {
    if (provider === 'stripe') {
      // Stripe-specific logic mixed in
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        payment_method_data: {
          type: 'card',
          card: {
            number: cardDetails.number,
            exp_month: cardDetails.expMonth,
            exp_year: cardDetails.expYear,
            cvc: cardDetails.cvc
          }
        },
        confirm: true
      });

      if (paymentIntent.status === 'succeeded') {
        return { success: true, id: paymentIntent.id };
      } else {
        return { success: false, error: 'Payment failed' };
      }
    } else if (provider === 'paypal') {
      // PayPal-specific logic mixed in
      const order = await this.paypal.orders.create({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(), // Different format
            value: amount.toFixed(2) // Different format
          }
        }],
        payment_source: {
          card: {
            number: cardDetails.number,
            expiry: \`\${cardDetails.expMonth}/\${cardDetails.expYear}\`, // Different format
            security_code: cardDetails.cvc
          }
        }
      });

      const capture = await this.paypal.orders.capture(order.id);
      
      if (capture.status === 'COMPLETED') {
        return { success: true, id: capture.id };
      } else {
        return { success: false, error: 'Payment failed' };
      }
    }

    throw new Error('Unsupported payment provider');
  }
}`,
      explanation: 'The good example uses adapter patterns to create clean integration boundaries, making it easy to add new payment providers or change implementations. The bad example tightly couples business logic with specific provider APIs, making it hard to maintain and extend.'
    },

    {
      language: 'javascript',
      title: 'Standardized Error Handling Across Technologies',
      goodExample: `// Good: Consistent error handling across different technologies
// Standard error format
interface StandardError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  traceId: string;
  source: string;
}

// Error translation service
class ErrorTranslationService {
  private static errorMappings = new Map([
    // Database errors
    ['ECONNREFUSED', { code: 'DATABASE_CONNECTION_ERROR', message: 'Unable to connect to database' }],
    ['ER_DUP_ENTRY', { code: 'DUPLICATE_ENTRY', message: 'Record already exists' }],
    
    // HTTP errors
    ['ENOTFOUND', { code: 'NETWORK_ERROR', message: 'Network connection failed' }],
    ['ETIMEDOUT', { code: 'REQUEST_TIMEOUT', message: 'Request timed out' }],
    
    // Validation errors
    ['VALIDATION_ERROR', { code: 'INVALID_INPUT', message: 'Input validation failed' }],
    
    // Authentication errors
    ['UNAUTHORIZED', { code: 'AUTH_REQUIRED', message: 'Authentication required' }],
    ['FORBIDDEN', { code: 'ACCESS_DENIED', message: 'Access denied' }]
  ]);

  static translateError(error: any, source: string, traceId: string): StandardError {
    const mapping = this.errorMappings.get(error.code || error.name || 'UNKNOWN');
    
    return {
      code: mapping?.code || 'INTERNAL_ERROR',
      message: mapping?.message || error.message || 'An unexpected error occurred',
      details: {
        originalError: error.code || error.name,
        originalMessage: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString(),
      traceId,
      source
    };
  }
}

// Database service with error translation
class DatabaseService {
  async findUser(id: string, traceId: string): Promise<User> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (result.length === 0) {
        throw new Error('User not found');
      }
      return result[0];
    } catch (error) {
      throw ErrorTranslationService.translateError(error, 'database', traceId);
    }
  }

  async createUser(userData: CreateUserData, traceId: string): Promise<User> {
    try {
      const result = await this.db.query('INSERT INTO users SET ?', userData);
      return { id: result.insertId, ...userData };
    } catch (error) {
      throw ErrorTranslationService.translateError(error, 'database', traceId);
    }
  }
}

// API service with error translation
class ApiService {
  async fetchExternalData(url: string, traceId: string): Promise<any> {
    try {
      const response = await fetch(url, { timeout: 5000 });
      
      if (!response.ok) {
        const error = new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        error.name = response.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR';
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      throw ErrorTranslationService.translateError(error, 'external-api', traceId);
    }
  }
}

// Express middleware for consistent error responses
function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  const traceId = req.headers['x-trace-id'] as string || generateTraceId();
  
  let standardError: StandardError;
  
  if (error.code && error.source) {
    // Already a standard error
    standardError = error;
  } else {
    // Translate to standard error
    standardError = ErrorTranslationService.translateError(error, 'api', traceId);
  }

  // Log error for monitoring
  logger.error('Request failed', {
    traceId,
    error: standardError,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  });

  // Send consistent error response
  const statusCode = getStatusCodeFromError(standardError.code);
  res.status(statusCode).json({
    error: {
      code: standardError.code,
      message: standardError.message,
      traceId: standardError.traceId,
      timestamp: standardError.timestamp
    }
  });
}

function getStatusCodeFromError(errorCode: string): number {
  const statusMap = {
    'AUTH_REQUIRED': 401,
    'ACCESS_DENIED': 403,
    'NOT_FOUND': 404,
    'INVALID_INPUT': 400,
    'DUPLICATE_ENTRY': 409,
    'REQUEST_TIMEOUT': 408,
    'DATABASE_CONNECTION_ERROR': 503,
    'NETWORK_ERROR': 502,
    'INTERNAL_ERROR': 500
  };
  
  return statusMap[errorCode] || 500;
}`,
      badExample: `// Bad: Inconsistent error handling across technologies
// Database service with raw errors
class DatabaseService {
  async findUser(id: string): Promise<User> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
      return result[0]; // No error if not found
    } catch (error) {
      throw error; // Raw database error exposed
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const result = await this.db.query('INSERT INTO users SET ?', userData);
    return { id: result.insertId, ...userData };
    // No error handling at all
  }
}

// API service with different error format
class ApiService {
  async fetchExternalData(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      // Different error format
      throw {
        status: 'error',
        msg: error.message,
        time: Date.now()
      };
    }
  }
}

// Inconsistent Express error handling
app.use((error, req, res, next) => {
  if (error.code === 'ER_DUP_ENTRY') {
    res.status(400).json({ message: 'Duplicate entry' });
  } else if (error.message.includes('not found')) {
    res.status(404).json({ error: 'Not found' });
  } else if (error.status === 'error') {
    res.status(500).json({ msg: error.msg });
  } else {
    res.status(500).json({ error: 'Something went wrong' });
  }
});`,
      explanation: 'The good example implements consistent error translation and handling across all technologies, providing predictable error formats and proper logging. The bad example has inconsistent error formats and handling, making debugging and client error handling difficult.'
    },

    {
      language: 'javascript',
      title: 'Unified Authentication Across Technologies',
      goodExample: `// Good: Standardized authentication across different services
// JWT token service
class TokenService {
  private secretKey: string;
  private issuer: string;

  constructor(secretKey: string, issuer: string) {
    this.secretKey = secretKey;
    this.issuer = issuer;
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: '1h',
      issuer: this.issuer,
      audience: 'api'
    });
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secretKey, {
        issuer: this.issuer,
        audience: 'api'
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  refreshToken(token: string): string {
    const payload = this.verifyToken(token);
    // Remove exp claim for refresh
    const { exp, iat, ...refreshPayload } = payload;
    return this.generateToken(refreshPayload);
  }
}

// Authentication middleware for Express
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: { 
        code: 'AUTH_REQUIRED', 
        message: 'Access token required' 
      } 
    });
  }

  try {
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: { 
        code: 'INVALID_TOKEN', 
        message: 'Invalid or expired token' 
      } 
    });
  }
}

// WebSocket authentication
class WebSocketAuthenticator {
  static authenticate(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = tokenService.verifyToken(token);
      socket.user = payload;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  }
}

// GraphQL authentication
const authDirective = {
  AUTH: (next: any, source: any, args: any, context: any) => {
    const token = context.req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const payload = tokenService.verifyToken(token);
      context.user = payload;
      return next();
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

// Database service with user context
class UserService {
  async getCurrentUser(userId: string): Promise<User> {
    return this.db.findUser(userId);
  }

  async updateUser(userId: string, updates: Partial<User>, requestingUserId: string): Promise<User> {
    // Authorization check
    if (userId !== requestingUserId) {
      const requestingUser = await this.getCurrentUser(requestingUserId);
      if (!requestingUser.roles.includes('admin')) {
        throw new Error('Access denied');
      }
    }

    return this.db.updateUser(userId, updates);
  }
}

// Client-side authentication service
class ClientAuthService {
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();
    
    if (result.token) {
      this.token = result.token;
      localStorage.setItem('auth_token', result.token);
    }

    return result;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.token || localStorage.getItem('auth_token');
    return token ? { 'Authorization': \`Bearer \${token}\` } : {};
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...options.headers,
      ...this.getAuthHeaders()
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      this.logout();
      throw new Error('Authentication required');
    }

    return response;
  }
}`,
      badExample: `// Bad: Inconsistent authentication across technologies
// Different token formats for different services
class ExpressAuth {
  authenticate(req, res, next) {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !sessions[sessionId]) {
      return res.status(401).send('Unauthorized');
    }
    req.userId = sessions[sessionId].userId;
    next();
  }
}

// WebSocket uses different auth mechanism
io.use((socket, next) => {
  const apiKey = socket.handshake.query.apiKey;
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    next(new Error('Invalid API key'));
  }
  socket.userId = apiKeyToUserId[apiKey];
  next();
});

// GraphQL uses yet another auth method
const resolvers = {
  Query: {
    user: (parent, args, context) => {
      const basicAuth = context.req.headers.authorization;
      if (!basicAuth) {
        throw new Error('No auth header');
      }
      
      const [username, password] = Buffer.from(basicAuth.split(' ')[1], 'base64').toString().split(':');
      if (!validateCredentials(username, password)) {
        throw new Error('Invalid credentials');
      }
      
      return getUserByUsername(username);
    }
  }
};

// Client has to handle different auth methods
class ApiClient {
  async callRestApi() {
    // Uses cookies
    return fetch('/api/data', { credentials: 'include' });
  }

  async callWebSocket() {
    // Uses API key
    return io.connect('/', { query: { apiKey: 'abc123' } });
  }

  async callGraphQL() {
    // Uses basic auth
    const auth = btoa('username:password');
    return fetch('/graphql', {
      headers: { 'Authorization': \`Basic \${auth}\` }
    });
  }
}`,
      explanation: 'The good example implements consistent JWT-based authentication across all technologies (REST, WebSocket, GraphQL), providing a unified experience. The bad example uses different authentication methods for each technology, creating complexity and security inconsistencies.'
    }
  ],
  relatedGuidelines: [
    'architecture-data-flow',
    'architecture-modularity',
    'security-authentication',
    'testing-integration'
  ]
};