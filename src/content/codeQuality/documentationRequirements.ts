import { GuidelineEntry } from '../../types';

export const documentationRequirements: GuidelineEntry = {
  id: 'documentation-requirements',
  title: 'Documentation Requirements',
  category: 'code-quality',
  priority: 'critical',
  description: 'Comment and documentation standards for creating maintainable, understandable code with comprehensive documentation.',
  rules: [
    {
      statement: 'Write clear, concise comments that explain why, not what',
      rationale: 'Good comments explain the reasoning behind code decisions, making maintenance and debugging easier',
      implementation: 'Focus on business logic, complex algorithms, and non-obvious decisions. Avoid comments that simply restate the code',
      validation: {
        method: 'Code review and documentation quality assessment'
      }
    },
    {
      statement: 'Use JSDoc or TypeScript documentation for all public APIs',
      rationale: 'Structured documentation enables IDE support, generates documentation, and helps other developers understand interfaces',
      implementation: 'Document all public functions, classes, and modules with parameter types, return values, and usage examples',
      validation: {
        method: 'Documentation generation and API review'
      }
    },
    {
      statement: 'Maintain up-to-date README files with clear setup and usage instructions',
      rationale: 'README files are the first point of contact for developers and should provide all necessary information to get started',
      implementation: 'Include project description, installation steps, usage examples, API documentation, and contribution guidelines',
      validation: {
        method: 'Documentation review and new developer onboarding testing'
      }
    },
    {
      statement: 'Document complex business logic and algorithms with inline comments',
      rationale: 'Complex logic requires explanation to prevent bugs during maintenance and help future developers understand the implementation',
      implementation: 'Add comments before complex functions, explain algorithm steps, document edge cases and assumptions',
      validation: {
        method: 'Code review focusing on business logic documentation'
      }
    },
    {
      statement: 'Keep documentation synchronized with code changes',
      rationale: 'Outdated documentation is worse than no documentation as it misleads developers',
      implementation: 'Update documentation as part of code changes, use automated tools to detect documentation drift, include documentation updates in code reviews',
      validation: {
        method: 'Regular documentation audits and automated checking'
      }
    }
  ],
  examples: [
    {
      language: 'typescript',
      title: 'JSDoc Documentation for APIs',
      goodExample: `/**
 * User management service for handling user operations
 * Provides methods for creating, updating, and retrieving user data
 * with proper validation and error handling.
 */
export class UserService {
  private readonly apiClient: ApiClient;
  private readonly cache: Map<string, User> = new Map();

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Retrieves a user by their unique identifier
   * 
   * @param userId - The unique identifier for the user
   * @param options - Optional configuration for the request
   * @param options.useCache - Whether to use cached data if available (default: true)
   * @param options.timeout - Request timeout in milliseconds (default: 5000)
   * @returns Promise that resolves to the user data
   * 
   * @throws {ValidationError} When userId is invalid
   * @throws {NotFoundError} When user doesn't exist
   * @throws {NetworkError} When request fails
   * 
   * @example
   * \`\`\`typescript
   * const userService = new UserService(apiClient);
   * 
   * try {
   *   const user = await userService.getUserById('user-123');
   *   console.log(user.name);
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.log('User not found');
   *   }
   * }
   * \`\`\`
   */
  async getUserById(
    userId: string, 
    options: { useCache?: boolean; timeout?: number } = {}
  ): Promise<User> {
    const { useCache = true, timeout = 5000 } = options;

    // Validate input - user ID must be a non-empty string
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationError('User ID must be a non-empty string');
    }

    // Check cache first if enabled - improves performance for repeated requests
    if (useCache && this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    try {
      const response = await this.apiClient.get(\`/users/\${userId}\`, { timeout });
      
      if (!response.ok) {
        // Handle different HTTP status codes appropriately
        if (response.status === 404) {
          throw new NotFoundError(\`User with ID \${userId} not found\`);
        }
        throw new NetworkError(\`Failed to fetch user: \${response.status}\`);
      }

      const userData = await response.json();
      
      // Validate response structure before returning
      if (!this.isValidUserData(userData)) {
        throw new ValidationError('Invalid user data received from API');
      }

      // Cache successful results for future requests
      if (useCache) {
        this.cache.set(userId, userData);
      }

      return userData;
      
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (error instanceof ValidationError || 
          error instanceof NotFoundError || 
          error instanceof NetworkError) {
        throw error;
      }
      
      throw new NetworkError(\`Unexpected error fetching user: \${error.message}\`);
    }
  }

  /**
   * Validates user data structure
   * 
   * @private
   * @param userData - The user data to validate
   * @returns True if the user data is valid, false otherwise
   */
  private isValidUserData(userData: any): userData is User {
    return userData && 
           typeof userData.id === 'string' && 
           typeof userData.name === 'string' &&
           typeof userData.email === 'string' &&
           userData.id.length > 0 &&
           userData.name.length > 0 &&
           userData.email.includes('@');
  }
}`,
      badExample: `// Poor documentation - minimal and unhelpful comments
export class UserService {
  private apiClient: ApiClient;
  private cache: Map<string, User> = new Map();

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Get user
  async getUserById(userId: string, options: any = {}): Promise<User> {
    // Check if userId exists
    if (!userId) {
      throw new Error('Invalid user ID');
    }

    // Look in cache
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    // Make API call
    const response = await this.apiClient.get('/users/' + userId);
    
    // Check response
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const userData = await response.json();
    
    // Save to cache
    this.cache.set(userId, userData);

    return userData;
  }

  // Check if user data is valid
  private isValidUserData(userData: any): boolean {
    return userData && userData.id && userData.name && userData.email;
  }
}`,
      explanation: 'The good example provides comprehensive JSDoc documentation with parameter descriptions, return types, error conditions, and usage examples, while the bad example has minimal, unhelpful comments.'
    }
  ],
  relatedGuidelines: ['javascript-standards', 'project-organization']
};