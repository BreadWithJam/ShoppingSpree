import { GuidelineEntry, Rule, CodeExample } from '../../models';

export const javascriptStandards: GuidelineEntry = {
  id: 'javascript-standards',
  title: 'JavaScript Standards Guidelines',
  category: 'code-quality',
  priority: 'critical',
  description: 'JavaScript code structure and error handling rules for writing maintainable, reliable, and performant JavaScript code.',
  rules: [
    {
      statement: 'Use consistent naming conventions (camelCase for variables and functions, PascalCase for classes)',
      rationale: 'Consistent naming improves code readability and follows JavaScript community standards',
      implementation: 'Variables and functions: camelCase (userName, getUserData). Classes and constructors: PascalCase (UserManager, ApiClient). Constants: UPPER_SNAKE_CASE (API_BASE_URL)',
      validation: {
        method: 'ESLint rules and code review'
      }
    },
    {
      statement: 'Implement comprehensive error handling with try-catch blocks and proper error propagation',
      rationale: 'Proper error handling prevents application crashes and provides better user experience',
      implementation: 'Use try-catch for async operations, validate inputs, throw meaningful errors, handle edge cases gracefully',
      validation: {
        method: 'Code review and error testing scenarios'
      }
    },
    {
      statement: 'Use modern JavaScript features (ES6+) and avoid deprecated patterns',
      rationale: 'Modern JavaScript features improve code quality, performance, and maintainability',
      implementation: 'Use const/let instead of var, arrow functions, template literals, destructuring, async/await, modules',
      validation: {
        method: 'ESLint configuration and code review'
      }
    },
    {
      statement: 'Write pure functions when possible and minimize side effects',
      rationale: 'Pure functions are easier to test, debug, and reason about',
      implementation: 'Functions should return consistent output for same input, avoid modifying global state, clearly separate pure and impure functions',
      validation: {
        method: 'Code review and functional testing'
      }
    },
    {
      statement: 'Use proper async/await patterns and handle Promise rejections',
      rationale: 'Proper async handling prevents race conditions and unhandled promise rejections',
      implementation: 'Use async/await for cleaner code, handle errors in async functions, avoid mixing callbacks with promises',
      validation: {
        method: 'Testing async scenarios and error conditions'
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Modern JavaScript with Error Handling',
      goodExample: `// Modern JavaScript with proper error handling
class UserManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.users = new Map();
  }

  async getUserById(userId) {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    // Check cache first
    if (this.users.has(userId)) {
      return this.users.get(userId);
    }

    try {
      const response = await this.apiClient.get(\`/users/\${userId}\`);
      
      if (!response.ok) {
        throw new Error(\`Failed to fetch user: \${response.status}\`);
      }

      const userData = await response.json();
      
      // Validate response data
      if (!this.isValidUserData(userData)) {
        throw new Error('Invalid user data received from API');
      }

      // Cache the result
      this.users.set(userId, userData);
      return userData;
      
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(\`Unable to retrieve user \${userId}: \${error.message}\`);
    }
  }

  // Pure function for validation
  isValidUserData(userData) {
    return userData && 
           typeof userData.id === 'string' && 
           typeof userData.name === 'string' &&
           typeof userData.email === 'string';
  }

  // Async function with proper error handling
  async createUser(userData) {
    try {
      const { name, email, ...otherData } = userData;
      
      // Validate required fields
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        ...otherData
      };

      const response = await this.apiClient.post('/users', newUser);
      
      if (!response.ok) {
        throw new Error(\`Failed to create user: \${response.status}\`);
      }

      const createdUser = await response.json();
      this.users.set(createdUser.id, createdUser);
      
      return createdUser;
      
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }
}

// Usage with proper error handling
const userManager = new UserManager(apiClient);

try {
  const user = await userManager.getUserById('123');
  console.log('User found:', user.name);
} catch (error) {
  console.error('Failed to get user:', error.message);
  // Handle error appropriately (show user message, fallback, etc.)
}`,
      badExample: `// Poor JavaScript practices
var UserManager = function(apiClient) {
  this.apiClient = apiClient;
  this.users = {};
}

UserManager.prototype.getUserById = function(userId, callback) {
  var self = this;
  
  // No input validation
  if (self.users[userId]) {
    callback(null, self.users[userId]);
    return;
  }

  // No error handling
  self.apiClient.get('/users/' + userId, function(response) {
    var userData = JSON.parse(response);
    self.users[userId] = userData;
    callback(null, userData);
  });
}

UserManager.prototype.createUser = function(userData) {
  // No validation, no error handling
  var newUser = {
    id: Math.random().toString(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date()
  };

  this.apiClient.post('/users', newUser);
  this.users[newUser.id] = newUser;
  return newUser;
}

// Usage without error handling
var userManager = new UserManager(apiClient);
userManager.getUserById('123', function(err, user) {
  console.log(user.name); // Could crash if user is null
});`,
      explanation: 'The good example uses modern JavaScript features, proper error handling, input validation, and clear separation of concerns, while the bad example uses outdated patterns and lacks error handling.'
    },
    {
      language: 'javascript',
      title: 'Pure Functions and Side Effect Management',
      goodExample: `// Pure functions - no side effects
const calculateTax = (amount, taxRate) => {
  if (typeof amount !== 'number' || typeof taxRate !== 'number') {
    throw new Error('Amount and tax rate must be numbers');
  }
  
  if (amount < 0 || taxRate < 0) {
    throw new Error('Amount and tax rate must be positive');
  }
  
  return Math.round(amount * taxRate * 100) / 100;
};

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const calculateOrderTotal = (items, taxRate, discountPercent = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const discountAmount = subtotal * (discountPercent / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const tax = calculateTax(discountedSubtotal, taxRate);
  
  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    tax,
    total: discountedSubtotal + tax
  };
};

// Impure functions - clearly separated and documented
class OrderService {
  constructor(logger, database) {
    this.logger = logger;
    this.database = database;
  }

  // Clearly impure - has side effects (logging, database)
  async saveOrder(orderData) {
    try {
      this.logger.info('Saving order', { orderId: orderData.id });
      
      const savedOrder = await this.database.orders.create(orderData);
      
      this.logger.info('Order saved successfully', { 
        orderId: savedOrder.id,
        total: savedOrder.total 
      });
      
      return savedOrder;
      
    } catch (error) {
      this.logger.error('Failed to save order', { 
        orderId: orderData.id,
        error: error.message 
      });
      throw error;
    }
  }
}

// Usage combining pure and impure functions
const items = [
  { price: 29.99, quantity: 2 },
  { price: 15.50, quantity: 1 }
];

// Pure calculation
const orderCalculation = calculateOrderTotal(items, 0.08, 10);

// Impure operation
const orderService = new OrderService(logger, database);
const savedOrder = await orderService.saveOrder({
  id: crypto.randomUUID(),
  items,
  ...orderCalculation,
  createdAt: new Date().toISOString()
});`,
      badExample: `// Mixed pure and impure functions, unclear side effects
let globalTaxRate = 0.08;
let orderCount = 0;

function calculateTax(amount) {
  // Relies on global state
  orderCount++; // Unexpected side effect
  console.log('Calculating tax for order #' + orderCount); // Side effect
  return amount * globalTaxRate;
}

function calculateOrderTotal(items, discount) {
  let total = 0;
  
  // Modifies input parameter
  items.forEach(item => {
    item.processed = true; // Unexpected mutation
    total += item.price * item.quantity;
  });
  
  // Side effects mixed with calculation
  console.log('Processing ' + items.length + ' items');
  
  if (discount) {
    total = total - (total * discount);
    // Modifies global state
    globalTaxRate = 0.05; // Changes global tax rate!
  }
  
  return total + calculateTax(total);
}

// Usage - unpredictable results
const items = [
  { price: 29.99, quantity: 2 },
  { price: 15.50, quantity: 1 }
];

const total1 = calculateOrderTotal(items, 0.1);
const total2 = calculateOrderTotal(items, 0.1); // Different result due to side effects!`,
      explanation: 'The good example clearly separates pure functions from impure ones, making the code predictable and testable, while the bad example mixes side effects with calculations, making it unpredictable.'
    }
  ],
  relatedGuidelines: ['project-organization', 'documentation-requirements']
};