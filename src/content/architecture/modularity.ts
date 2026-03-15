import { GuidelineEntry } from '../../types';

/**
 * Modularity and Reusability Standards
 * Create modularity and reusability guidelines
 */

export const modularityGuidelines: GuidelineEntry = {
  id: 'architecture-modularity',
  title: 'Modularity and Reusability Standards',
  category: 'architecture',
  priority: 'critical',
  description: 'Comprehensive guidelines for creating modular, reusable components and systems that promote code maintainability, testability, and scalability.',
  rules: [
    {
      statement: 'Design components with single responsibility principle',
      rationale: 'Components with single responsibility are easier to understand, test, maintain, and reuse across different contexts.',
      implementation: 'Each component should have one clear purpose. Split complex components into smaller, focused components that handle specific functionality.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['component-analyzer']
      }
    },

    {
      statement: 'Implement loose coupling between modules',
      rationale: 'Loose coupling reduces dependencies, making modules more independent, testable, and easier to modify without affecting other parts.',
      implementation: 'Use dependency injection, event systems, or well-defined interfaces. Avoid direct imports of implementation details.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['dependency-analyzer']
      }
    },

    {
      statement: 'Create reusable component interfaces',
      rationale: 'Well-defined interfaces enable components to be used in different contexts while maintaining consistent behavior and API.',
      implementation: 'Define clear props/parameters, return types, and behavior contracts. Use TypeScript interfaces or PropTypes for validation.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['interface-checker']
      }
    },

    {
      statement: 'Implement proper abstraction layers',
      rationale: 'Abstraction layers hide implementation complexity and provide stable interfaces that can evolve independently.',
      implementation: 'Create service layers, data access layers, and presentation layers. Use abstract classes or interfaces to define contracts.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['abstraction-analyzer']
      }
    },

    {
      statement: 'Use composition over inheritance',
      rationale: 'Composition provides more flexibility, reduces coupling, and avoids the fragile base class problem common with inheritance.',
      implementation: 'Favor composing objects from smaller parts rather than extending base classes. Use mixins, higher-order components, or composition patterns.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['composition-checker']
      }
    },

    {
      statement: 'Implement consistent naming conventions',
      rationale: 'Consistent naming makes code more predictable, easier to understand, and reduces cognitive load when working with multiple modules.',
      implementation: 'Establish and follow naming patterns for components, functions, variables, and files. Document naming conventions in style guides.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['naming-convention-checker']
      }
    },

    {
      statement: 'Create comprehensive component documentation',
      rationale: 'Good documentation enables other developers to understand and reuse components effectively without diving into implementation details.',
      implementation: 'Document component purpose, API, usage examples, and edge cases. Use tools like Storybook or JSDoc for interactive documentation.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['documentation-checker']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Single Responsibility Components',
      goodExample: `// Good: Each component has a single, clear responsibility
// UserProfile component - only handles user profile display
function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <UserAvatar src={user.avatar} alt={user.name} />
      <UserInfo name={user.name} email={user.email} />
      <UserStats posts={user.postCount} followers={user.followerCount} />
    </div>
  );
}

// UserAvatar component - only handles avatar display
function UserAvatar({ src, alt, size = 'medium' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  return (
    <img 
      src={src} 
      alt={alt}
      className={\`rounded-full \${sizeClasses[size]}\`}
      onError={(e) => {
        e.target.src = '/default-avatar.png';
      }}
    />
  );
}

// UserInfo component - only handles basic user information
function UserInfo({ name, email }) {
  return (
    <div className="user-info">
      <h3 className="user-name">{name}</h3>
      <p className="user-email">{email}</p>
    </div>
  );
}`,
      badExample: `// Bad: Component handles multiple responsibilities
function UserProfile({ user, onEdit, onDelete, onFollow, showStats, allowEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState(null);

  // Avatar handling
  const handleAvatarError = (e) => {
    e.target.src = '/default-avatar.png';
  };

  // Edit functionality
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onEdit(editData);
    setIsEditing(false);
  };

  // Follow functionality
  const handleFollow = async () => {
    await onFollow(user.id);
    setIsFollowing(!isFollowing);
  };

  // Stats fetching
  useEffect(() => {
    if (showStats) {
      fetchUserStats(user.id).then(setStats);
    }
  }, [user.id, showStats]);

  return (
    <div className="user-profile">
      {/* Avatar, editing, following, stats all mixed together */}
      <img 
        src={user.avatar} 
        alt={user.name}
        onError={handleAvatarError}
      />
      {isEditing ? (
        <input 
          value={editData.name}
          onChange={(e) => setEditData({...editData, name: e.target.value})}
        />
      ) : (
        <h3>{user.name}</h3>
      )}
      {allowEdit && (
        <button onClick={isEditing ? handleSave : handleEdit}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      )}
      <button onClick={handleFollow}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
      {showStats && stats && (
        <div>Posts: {stats.posts}, Followers: {stats.followers}</div>
      )}
    </div>
  );
}`,
      explanation: 'The good example breaks down functionality into focused components with single responsibilities. The bad example mixes avatar display, editing, following, and stats in one component, making it hard to maintain and reuse.'
    },

    {
      language: 'javascript',
      title: 'Loose Coupling with Dependency Injection',
      goodExample: `// Good: Loose coupling through dependency injection
class UserService {
  constructor(apiClient, cacheService, logger) {
    this.apiClient = apiClient;
    this.cacheService = cacheService;
    this.logger = logger;
  }

  async getUser(id) {
    try {
      // Check cache first
      const cached = await this.cacheService.get(\`user:\${id}\`);
      if (cached) {
        this.logger.info('User found in cache', { userId: id });
        return cached;
      }

      // Fetch from API
      const user = await this.apiClient.get(\`/users/\${id}\`);
      
      // Cache the result
      await this.cacheService.set(\`user:\${id}\`, user, 300); // 5 minutes
      
      this.logger.info('User fetched from API', { userId: id });
      return user;
    } catch (error) {
      this.logger.error('Failed to get user', { userId: id, error });
      throw error;
    }
  }
}

// Dependency injection setup
const apiClient = new ApiClient({ baseURL: '/api' });
const cacheService = new RedisCache({ host: 'localhost' });
const logger = new Logger({ level: 'info' });

const userService = new UserService(apiClient, cacheService, logger);

// Easy to test with mocks
const mockApiClient = { get: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };
const mockLogger = { info: jest.fn(), error: jest.fn() };
const testUserService = new UserService(mockApiClient, mockCache, mockLogger);`,
      badExample: `// Bad: Tight coupling with direct dependencies
class UserService {
  constructor() {
    // Tightly coupled to specific implementations
    this.apiClient = new ApiClient({ baseURL: '/api' });
    this.cacheService = new RedisCache({ host: 'localhost' });
    this.logger = new Logger({ level: 'info' });
  }

  async getUser(id) {
    try {
      // Same logic but tightly coupled
      const cached = await this.cacheService.get(\`user:\${id}\`);
      if (cached) {
        this.logger.info('User found in cache', { userId: id });
        return cached;
      }

      const user = await this.apiClient.get(\`/users/\${id}\`);
      await this.cacheService.set(\`user:\${id}\`, user, 300);
      
      this.logger.info('User fetched from API', { userId: id });
      return user;
    } catch (error) {
      this.logger.error('Failed to get user', { userId: id, error });
      throw error;
    }
  }
}

// Hard to test - requires real dependencies
const userService = new UserService(); // Always creates real dependencies`,
      explanation: 'The good example uses dependency injection to decouple the service from specific implementations, making it testable and flexible. The bad example creates dependencies internally, making testing and configuration changes difficult.'
    },

    {
      language: 'typescript',
      title: 'Reusable Component Interfaces',
      goodExample: `// Good: Well-defined, reusable interfaces
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-testid'?: string;
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  'aria-label'?: string;
}

// Reusable Button component
function Button({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
  'data-testid': testId,
  ...rest 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const classes = \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      data-testid={testId}
      {...rest}
    >
      {loading && <Spinner size="small" />}
      {icon && !loading && icon}
      {children}
    </button>
  );
}

// Usage examples showing reusability
function Examples() {
  return (
    <div>
      <Button variant="primary" onClick={() => console.log('Primary clicked')}>
        Primary Action
      </Button>
      
      <Button 
        variant="secondary" 
        size="large" 
        icon={<Icon name="download" />}
        onClick={() => console.log('Download')}
      >
        Download File
      </Button>
      
      <Button 
        variant="danger" 
        loading={true}
        onClick={() => console.log('Deleting...')}
      >
        Delete Item
      </Button>
    </div>
  );
}`,
      badExample: `// Bad: Poorly defined, inflexible interfaces
interface ButtonProps {
  text: string;
  color?: string;
  big?: boolean;
  clickHandler?: Function;
  style?: any;
}

// Inflexible Button component
function Button({ text, color, big, clickHandler, style }: ButtonProps) {
  return (
    <button
      onClick={clickHandler}
      style={{
        backgroundColor: color || 'blue',
        fontSize: big ? '18px' : '14px',
        padding: big ? '12px 24px' : '8px 16px',
        ...style
      }}
    >
      {text}
    </button>
  );
}

// Limited usage - hard to extend
function Examples() {
  return (
    <div>
      <Button 
        text="Click me" 
        color="red" 
        clickHandler={() => console.log('clicked')} 
      />
      
      {/* Can't easily add icons, loading states, or variants */}
      <Button 
        text="Big Button" 
        big={true}
        style={{ border: '2px solid black' }} // Mixing concerns
      />
    </div>
  );
}`,
      explanation: 'The good example defines comprehensive, typed interfaces that support various use cases while maintaining consistency. The bad example has vague props and limited extensibility, making it hard to reuse effectively.'
    },

    {
      language: 'javascript',
      title: 'Composition Over Inheritance',
      goodExample: `// Good: Composition-based approach
// Base behaviors as composable functions
const withLogging = (component) => {
  return {
    ...component,
    log(message) {
      console.log(\`[\${component.name}] \${message}\`);
    }
  };
};

const withValidation = (component) => {
  return {
    ...component,
    validate(data) {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided');
      }
      return true;
    }
  };
};

const withCaching = (component) => {
  const cache = new Map();
  
  return {
    ...component,
    getCached(key) {
      return cache.get(key);
    },
    setCached(key, value) {
      cache.set(key, value);
    },
    clearCache() {
      cache.clear();
    }
  };
};

// Compose components with needed behaviors
const createUserManager = () => {
  const base = {
    name: 'UserManager',
    users: []
  };
  
  return withLogging(
    withValidation(
      withCaching(base)
    )
  );
};

const createProductManager = () => {
  const base = {
    name: 'ProductManager',
    products: []
  };
  
  return withLogging(
    withCaching(base)
  ); // No validation needed for products
};

// Usage
const userManager = createUserManager();
userManager.log('User manager created');
userManager.validate({ name: 'John' });
userManager.setCached('user:1', { name: 'John' });

const productManager = createProductManager();
productManager.log('Product manager created');
productManager.setCached('product:1', { name: 'Widget' });`,
      badExample: `// Bad: Inheritance-based approach
class BaseManager {
  constructor(name) {
    this.name = name;
  }
  
  log(message) {
    console.log(\`[\${this.name}] \${message}\`);
  }
}

class ValidatingManager extends BaseManager {
  validate(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided');
    }
    return true;
  }
}

class CachingValidatingManager extends ValidatingManager {
  constructor(name) {
    super(name);
    this.cache = new Map();
  }
  
  getCached(key) {
    return this.cache.get(key);
  }
  
  setCached(key, value) {
    this.cache.set(key, value);
  }
}

// Forced to inherit all behaviors, even if not needed
class UserManager extends CachingValidatingManager {
  constructor() {
    super('UserManager');
    this.users = [];
  }
}

// ProductManager forced to have validation it doesn't need
class ProductManager extends CachingValidatingManager {
  constructor() {
    super('ProductManager');
    this.products = [];
  }
  
  // Validation not needed but inherited anyway
}

// Deep inheritance hierarchy is fragile
const userManager = new UserManager();
const productManager = new ProductManager();`,
      explanation: 'The good example uses composition to mix and match behaviors as needed, providing flexibility and avoiding unnecessary dependencies. The bad example forces all subclasses to inherit all behaviors, creating rigid hierarchies and unnecessary coupling.'
    }
  ],
  relatedGuidelines: [
    'architecture-component-organization',
    'architecture-data-flow',
    'code-quality-standards',
    'testing-strategies'
  ]
};