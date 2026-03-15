import { GuidelineEntry } from '../../types';

/**
 * Testing Strategy Guidelines
 * Comprehensive requirements for unit testing and integration testing
 */

export const testingStrategyGuidelines: GuidelineEntry = {
  id: 'testing-strategy',
  title: 'Testing Strategy Guidelines',
  category: 'testing',
  priority: 'critical',
  description: 'Comprehensive guidelines for implementing effective testing strategies including unit testing, integration testing, and test-driven development practices.',
  rules: [
    {
      statement: 'Implement unit tests for all critical business logic functions',
      rationale: 'Unit tests catch bugs early, enable safe refactoring, and serve as living documentation of expected behavior.',
      implementation: 'Write isolated tests for individual functions, classes, and modules using a testing framework like Jest, Mocha, or Vitest.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['test-coverage-reporter']
      }
    },

    {
      statement: 'Achieve minimum 80% code coverage for critical paths',
      rationale: 'High code coverage ensures most code paths are tested, reducing the likelihood of undetected bugs in production.',
      implementation: 'Use coverage tools to measure test coverage and focus on testing critical business logic, error handling, and edge cases.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['istanbul', 'nyc', 'jest-coverage']
      }
    },

    {
      statement: 'Write integration tests for component interactions',
      rationale: 'Integration tests verify that different parts of the system work correctly together, catching interface and communication issues.',
      implementation: 'Test API endpoints, database interactions, and component integration using tools like Supertest, Cypress, or Playwright.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['integration-test-runner']
      }
    },

    {
      statement: 'Follow the AAA pattern (Arrange, Act, Assert) in test structure',
      rationale: 'The AAA pattern makes tests more readable, maintainable, and easier to understand by clearly separating setup, execution, and verification.',
      implementation: 'Structure each test with clear sections: setup test data (Arrange), execute the function (Act), and verify results (Assert).',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['manual-review']
      }
    },

    {
      statement: 'Use descriptive test names that explain the scenario and expected outcome',
      rationale: 'Clear test names serve as documentation and make it easier to understand what functionality is being tested and why tests fail.',
      implementation: 'Name tests using the pattern "should [expected behavior] when [condition]" or "given [context] when [action] then [outcome]".',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['manual-review']
      }
    },

    {
      statement: 'Mock external dependencies in unit tests',
      rationale: 'Mocking external dependencies ensures tests are fast, reliable, and isolated from external systems that may be unavailable or slow.',
      implementation: 'Use mocking libraries like Jest mocks, Sinon, or MSW to replace external APIs, databases, and file system operations.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['manual-review']
      }
    },

    {
      statement: 'Implement property-based testing for complex algorithms',
      rationale: 'Property-based testing generates many test cases automatically, finding edge cases that manual testing might miss.',
      implementation: 'Use libraries like fast-check, JSVerify, or Hypothesis to test properties that should hold for all valid inputs.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['property-test-runner']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Unit Test with AAA Pattern',
      goodExample: `// Good: Clear AAA structure with descriptive name
describe('UserValidator', () => {
  test('should return validation error when email format is invalid', () => {
    // Arrange
    const invalidEmail = 'not-an-email';
    const validator = new UserValidator();
    
    // Act
    const result = validator.validateEmail(invalidEmail);
    
    // Assert
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });
  
  test('should return success when email format is valid', () => {
    // Arrange
    const validEmail = 'user@example.com';
    const validator = new UserValidator();
    
    // Act
    const result = validator.validateEmail(validEmail);
    
    // Assert
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });
});`,
      badExample: `// Bad: Unclear structure and naming
describe('UserValidator', () => {
  test('email test', () => {
    const result = new UserValidator().validateEmail('bad-email');
    expect(result.isValid).toBe(false);
  });
});`,
      explanation: 'The good example uses clear AAA structure, descriptive test names, and tests both positive and negative cases. The bad example lacks structure and clear intent.'
    },

    {
      language: 'javascript',
      title: 'Integration Test for API Endpoint',
      goodExample: `// Good: Integration test with proper setup and teardown
const request = require('supertest');
const app = require('../app');
const db = require('../database');

describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.clear();
  });
  
  afterEach(async () => {
    await db.clear();
  });
  
  test('should create user and return 201 when valid data provided', async () => {
    // Arrange
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };
    
    // Act
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    
    // Verify user was saved to database
    const savedUser = await db.users.findByEmail(userData.email);
    expect(savedUser).toBeTruthy();
  });
  
  test('should return 400 when email is already taken', async () => {
    // Arrange
    const existingUser = { name: 'Jane', email: 'jane@example.com', password: 'pass123' };
    await db.users.create(existingUser);
    
    const duplicateUserData = {
      name: 'John Doe',
      email: 'jane@example.com', // Same email
      password: 'SecurePass123!'
    };
    
    // Act
    const response = await request(app)
      .post('/api/users')
      .send(duplicateUserData);
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email already exists');
  });
});`,
      badExample: `// Bad: No setup/teardown, incomplete testing
describe('POST /api/users', () => {
  test('creates user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
  });
});`,
      explanation: 'The good example includes proper setup/teardown, tests multiple scenarios, verifies database state, and checks security concerns. The bad example lacks comprehensive testing and cleanup.'
    },

    {
      language: 'javascript',
      title: 'Mocking External Dependencies',
      goodExample: `// Good: Proper mocking of external API
const axios = require('axios');
const WeatherService = require('../services/WeatherService');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should return weather data when API call succeeds', async () => {
    // Arrange
    const mockWeatherData = {
      temperature: 25,
      condition: 'sunny',
      humidity: 60
    };
    
    mockedAxios.get.mockResolvedValue({
      data: mockWeatherData,
      status: 200
    });
    
    const weatherService = new WeatherService();
    
    // Act
    const result = await weatherService.getCurrentWeather('London');
    
    // Assert
    expect(result).toEqual(mockWeatherData);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.weather.com/current',
      { params: { city: 'London' } }
    );
  });
  
  test('should throw error when API call fails', async () => {
    // Arrange
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    const weatherService = new WeatherService();
    
    // Act & Assert
    await expect(weatherService.getCurrentWeather('London'))
      .rejects.toThrow('Failed to fetch weather data');
  });
});`,
      badExample: `// Bad: No mocking, depends on external service
describe('WeatherService', () => {
  test('gets weather', async () => {
    const weatherService = new WeatherService();
    const result = await weatherService.getCurrentWeather('London');
    expect(result.temperature).toBeGreaterThan(0);
  });
});`,
      explanation: 'The good example mocks the external API to ensure tests are fast and reliable, testing both success and failure scenarios. The bad example depends on external services, making tests slow and unreliable.'
    },

    {
      language: 'javascript',
      title: 'Property-Based Testing',
      goodExample: `// Good: Property-based testing for sorting function
const fc = require('fast-check');

describe('sortNumbers', () => {
  test('should maintain array length after sorting', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (numbers) => {
        const sorted = sortNumbers(numbers);
        return sorted.length === numbers.length;
      }
    ));
  });
  
  test('should produce sorted array in ascending order', () => {
    fc.assert(fc.property(
      fc.array(fc.integer(), { minLength: 1 }),
      (numbers) => {
        const sorted = sortNumbers(numbers);
        
        // Check if array is sorted
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] < sorted[i - 1]) {
            return false;
          }
        }
        return true;
      }
    ));
  });
  
  test('should be idempotent (sorting twice gives same result)', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (numbers) => {
        const sorted1 = sortNumbers(numbers);
        const sorted2 = sortNumbers(sorted1);
        return JSON.stringify(sorted1) === JSON.stringify(sorted2);
      }
    ));
  });
});`,
      badExample: `// Bad: Only testing specific cases
describe('sortNumbers', () => {
  test('sorts numbers', () => {
    expect(sortNumbers([3, 1, 2])).toEqual([1, 2, 3]);
    expect(sortNumbers([5, 4])).toEqual([4, 5]);
  });
});`,
      explanation: 'The good example uses property-based testing to verify mathematical properties that should hold for any input, finding edge cases automatically. The bad example only tests specific cases.'
    }
  ],
  relatedGuidelines: [
    'testing-markup-validation',
    'testing-compatibility',
    'testing-deployment-validation',
    'testing-automated'
  ]
};