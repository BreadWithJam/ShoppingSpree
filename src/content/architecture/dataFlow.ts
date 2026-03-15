import { GuidelineEntry } from '../../types';

/**
 * Data Flow and State Management Guidelines
 * Define state management and data handling patterns
 */

export const dataFlowGuidelines: GuidelineEntry = {
  id: 'architecture-data-flow',
  title: 'Data Flow and State Management',
  category: 'architecture',
  priority: 'critical',
  description: 'Comprehensive guidelines for implementing predictable data flow patterns and effective state management in web applications, ensuring maintainable and scalable architecture.',
  rules: [
    {
      statement: 'Implement unidirectional data flow',
      rationale: 'Unidirectional data flow makes application state changes predictable and easier to debug by establishing clear data flow patterns.',
      implementation: 'Use patterns like Flux, Redux, or similar architectures where data flows in one direction: Actions → Dispatcher → Store → View.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['data-flow-analyzer']
      }
    },

    {
      statement: 'Centralize application state management',
      rationale: 'Centralized state prevents inconsistencies, makes debugging easier, and provides a single source of truth for application data.',
      implementation: 'Use state management libraries like Redux, Vuex, or Context API. Keep global state in a central store and local state in components.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['state-management-checker']
      }
    },

    {
      statement: 'Separate business logic from presentation logic',
      rationale: 'Separation of concerns improves testability, reusability, and maintainability by keeping business rules independent of UI components.',
      implementation: 'Use service layers, custom hooks, or store actions to handle business logic. Keep components focused on presentation.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['separation-checker']
      }
    },

    {
      statement: 'Implement immutable state updates',
      rationale: 'Immutable updates prevent accidental state mutations, enable time-travel debugging, and improve performance through reference equality checks.',
      implementation: 'Use immutable update patterns, libraries like Immer, or built-in methods that return new objects instead of mutating existing ones.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['immutability-checker']
      }
    },

    {
      statement: 'Use proper data normalization',
      rationale: 'Normalized data structures prevent duplication, reduce memory usage, and make updates more efficient and consistent.',
      implementation: 'Store entities by ID in flat structures. Use lookup tables and avoid deeply nested objects. Consider libraries like normalizr.',
      validation: {
        method: 'code-review',
        automated: false,
        tools: ['normalization-checker']
      }
    },

    {
      statement: 'Implement proper error boundaries for state',
      rationale: 'Error boundaries prevent state corruption and provide graceful error handling when state operations fail.',
      implementation: 'Use try-catch blocks in state updates, implement error states in reducers, and provide fallback UI for error conditions.',
      validation: {
        method: 'manual',
        automated: false,
        tools: ['error-boundary-checker']
      }
    },

    {
      statement: 'Optimize state subscription patterns',
      rationale: 'Efficient subscriptions prevent unnecessary re-renders and improve application performance.',
      implementation: 'Use selectors to subscribe to specific state slices. Implement memoization and avoid subscribing to entire state objects.',
      validation: {
        method: 'automated',
        automated: true,
        tools: ['subscription-optimizer']
      }
    }
  ],
  examples: [
    {
      language: 'javascript',
      title: 'Unidirectional Data Flow with Redux',
      goodExample: `// Good: Clear unidirectional data flow
// Actions
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';

const addTodo = (text) => ({
  type: ADD_TODO,
  payload: { text, id: Date.now() }
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id }
});

// Reducer
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [...state, {
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      }];
    case TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
};

// Component
function TodoList({ todos, dispatch }) {
  const handleAddTodo = (text) => {
    dispatch(addTodo(text));
  };

  const handleToggleTodo = (id) => {
    dispatch(toggleTodo(id));
  };

  return (
    <div>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={() => handleToggleTodo(todo.id)} 
        />
      ))}
    </div>
  );
}`,
      badExample: `// Bad: Bidirectional data flow with direct mutations
function TodoList({ todos, setTodos }) {
  const handleAddTodo = (text) => {
    // Direct mutation of state
    todos.push({ id: Date.now(), text, completed: false });
    setTodos(todos); // Same reference, won't trigger re-render
  };

  const handleToggleTodo = (id) => {
    // Direct mutation
    const todo = todos.find(t => t.id === id);
    todo.completed = !todo.completed;
    setTodos(todos);
  };

  return (
    <div>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={() => handleToggleTodo(todo.id)} 
        />
      ))}
    </div>
  );
}`,
      explanation: 'The good example follows unidirectional data flow with clear actions, reducers, and immutable updates. The bad example directly mutates state and creates unpredictable data flow.'
    },

    {
      language: 'javascript',
      title: 'Centralized State Management',
      goodExample: `// Good: Centralized state with proper separation
// Store configuration
import { createStore, combineReducers } from 'redux';

const rootReducer = combineReducers({
  user: userReducer,
  todos: todosReducer,
  ui: uiReducer
});

const store = createStore(rootReducer);

// Selectors for accessing state
const getUser = (state) => state.user;
const getTodos = (state) => state.todos;
const getVisibleTodos = (state) => {
  const todos = getTodos(state);
  const filter = state.ui.filter;
  
  switch (filter) {
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'active':
      return todos.filter(todo => !todo.completed);
    default:
      return todos;
  }
};

// Component using selectors
function App() {
  const user = useSelector(getUser);
  const visibleTodos = useSelector(getVisibleTodos);
  const dispatch = useDispatch();

  return (
    <div>
      <UserProfile user={user} />
      <TodoList todos={visibleTodos} dispatch={dispatch} />
    </div>
  );
}`,
      badExample: `// Bad: Scattered state management
function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State scattered across multiple components
  // No single source of truth
  // Difficult to synchronize related state

  return (
    <div>
      <UserProfile 
        user={user} 
        setUser={setUser}
        setLoading={setLoading}
        setError={setError}
      />
      <TodoList 
        todos={todos} 
        setTodos={setTodos}
        filter={filter}
        setFilter={setFilter}
      />
    </div>
  );
}`,
      explanation: 'The good example uses centralized state management with selectors for computed values. The bad example scatters state across components, making it hard to maintain consistency.'
    },

    {
      language: 'javascript',
      title: 'Separation of Business Logic',
      goodExample: `// Good: Business logic separated from presentation
// Business logic layer
class TodoService {
  static validateTodo(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Todo text cannot be empty');
    }
    if (text.length > 100) {
      throw new Error('Todo text cannot exceed 100 characters');
    }
    return text.trim();
  }

  static async saveTodo(todo) {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save todo');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(\`Save failed: \${error.message}\`);
    }
  }
}

// Custom hook for business logic
function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTodo = async (text) => {
    try {
      setLoading(true);
      setError(null);
      
      const validatedText = TodoService.validateTodo(text);
      const newTodo = { text: validatedText, completed: false };
      const savedTodo = await TodoService.saveTodo(newTodo);
      
      setTodos(prev => [...prev, savedTodo]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { todos, addTodo, loading, error };
}

// Presentation component
function TodoForm() {
  const [text, setText] = useState('');
  const { addTodo, loading, error } = useTodos();

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Todo'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}`,
      badExample: `// Bad: Business logic mixed with presentation
function TodoForm() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Business logic mixed in component
    if (!text || text.trim().length === 0) {
      setError('Todo text cannot be empty');
      return;
    }
    
    if (text.length > 100) {
      setError('Todo text cannot exceed 100 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), completed: false })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save todo');
      }
      
      const savedTodo = await response.json();
      setTodos(prev => [...prev, savedTodo]);
      setText('');
    } catch (err) {
      setError(\`Save failed: \${err.message}\`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Todo'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}`,
      explanation: 'The good example separates business logic into services and custom hooks, keeping components focused on presentation. The bad example mixes validation, API calls, and UI logic in one component.'
    },

    {
      language: 'javascript',
      title: 'Immutable State Updates',
      goodExample: `// Good: Immutable state updates
// Using Immer for complex updates
import produce from 'immer';

const todosReducer = (state = initialState, action) => {
  return produce(state, draft => {
    switch (action.type) {
      case 'ADD_TODO':
        draft.todos.push({
          id: action.payload.id,
          text: action.payload.text,
          completed: false
        });
        draft.lastUpdated = Date.now();
        break;
        
      case 'UPDATE_TODO':
        const todo = draft.todos.find(t => t.id === action.payload.id);
        if (todo) {
          Object.assign(todo, action.payload.updates);
          draft.lastUpdated = Date.now();
        }
        break;
        
      case 'DELETE_TODO':
        const index = draft.todos.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          draft.todos.splice(index, 1);
          draft.lastUpdated = Date.now();
        }
        break;
    }
  });
};

// Manual immutable updates
const updateNestedState = (state, userId, updates) => ({
  ...state,
  users: {
    ...state.users,
    [userId]: {
      ...state.users[userId],
      ...updates,
      profile: {
        ...state.users[userId].profile,
        ...updates.profile
      }
    }
  },
  lastUpdated: Date.now()
});`,
      badExample: `// Bad: Mutating state directly
const todosReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      // Direct mutation
      state.todos.push({
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      });
      state.lastUpdated = Date.now();
      return state;
      
    case 'UPDATE_TODO':
      // Direct mutation
      const todo = state.todos.find(t => t.id === action.payload.id);
      if (todo) {
        Object.assign(todo, action.payload.updates);
        state.lastUpdated = Date.now();
      }
      return state;
      
    case 'DELETE_TODO':
      // Direct mutation
      const index = state.todos.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.todos.splice(index, 1);
        state.lastUpdated = Date.now();
      }
      return state;
      
    default:
      return state;
  }
};`,
      explanation: 'The good example uses immutable update patterns with Immer or manual spreading to create new state objects. The bad example directly mutates state, which can cause rendering issues and makes debugging difficult.'
    },

    {
      language: 'javascript',
      title: 'Data Normalization',
      goodExample: `// Good: Normalized data structure
const normalizedState = {
  users: {
    byId: {
      '1': { id: '1', name: 'John', email: 'john@example.com' },
      '2': { id: '2', name: 'Jane', email: 'jane@example.com' }
    },
    allIds: ['1', '2']
  },
  posts: {
    byId: {
      'a': { id: 'a', title: 'Post 1', authorId: '1', content: '...' },
      'b': { id: 'b', title: 'Post 2', authorId: '2', content: '...' }
    },
    allIds: ['a', 'b']
  },
  comments: {
    byId: {
      'x': { id: 'x', text: 'Great post!', authorId: '2', postId: 'a' },
      'y': { id: 'y', text: 'Thanks!', authorId: '1', postId: 'a' }
    },
    allIds: ['x', 'y']
  }
};

// Selectors for denormalized data
const getPostWithAuthor = (state, postId) => {
  const post = state.posts.byId[postId];
  const author = state.users.byId[post.authorId];
  return { ...post, author };
};

const getPostWithComments = (state, postId) => {
  const post = state.posts.byId[postId];
  const comments = state.comments.allIds
    .map(id => state.comments.byId[id])
    .filter(comment => comment.postId === postId)
    .map(comment => ({
      ...comment,
      author: state.users.byId[comment.authorId]
    }));
  
  return { ...post, comments };
};`,
      badExample: `// Bad: Denormalized nested structure
const denormalizedState = {
  posts: [
    {
      id: 'a',
      title: 'Post 1',
      content: '...',
      author: { id: '1', name: 'John', email: 'john@example.com' },
      comments: [
        {
          id: 'x',
          text: 'Great post!',
          author: { id: '2', name: 'Jane', email: 'jane@example.com' }
        },
        {
          id: 'y',
          text: 'Thanks!',
          author: { id: '1', name: 'John', email: 'john@example.com' }
        }
      ]
    },
    {
      id: 'b',
      title: 'Post 2',
      content: '...',
      author: { id: '2', name: 'Jane', email: 'jane@example.com' },
      comments: []
    }
  ]
};

// Updating user data requires finding all references
const updateUserName = (state, userId, newName) => {
  return {
    ...state,
    posts: state.posts.map(post => ({
      ...post,
      author: post.author.id === userId 
        ? { ...post.author, name: newName }
        : post.author,
      comments: post.comments.map(comment => ({
        ...comment,
        author: comment.author.id === userId
          ? { ...comment.author, name: newName }
          : comment.author
      }))
    }))
  };
};`,
      explanation: 'The good example uses normalized data structures with lookup tables, making updates efficient and preventing data duplication. The bad example has nested, denormalized data that requires complex updates and wastes memory.'
    }
  ],
  relatedGuidelines: [
    'architecture-component-organization',
    'architecture-modularity',
    'performance-optimization',
    'testing-strategies'
  ]
};