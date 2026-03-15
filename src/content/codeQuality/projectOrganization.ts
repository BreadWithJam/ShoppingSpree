import { GuidelineEntry } from '../../types';

export const projectOrganization: GuidelineEntry = {
  id: 'project-organization',
  title: 'Project Organization Guidelines',
  category: 'code-quality',
  priority: 'critical',
  description: 'Directory structure and file naming standards for organizing web development projects in a scalable, maintainable way.',
  rules: [
    {
      statement: 'Use consistent directory structure that separates concerns',
      rationale: 'Clear directory structure makes projects easier to navigate, understand, and maintain as they grow',
      implementation: 'Organize by feature or layer (src/, assets/, tests/, docs/). Group related files together. Use standard names for common directories',
      validation: {
        method: 'Project structure review and documentation'
      }
    },
    {
      statement: 'Follow consistent file naming conventions',
      rationale: 'Consistent naming prevents conflicts, improves discoverability, and works across different operating systems',
      implementation: 'Use kebab-case for files and directories, PascalCase for component files, descriptive names that indicate purpose',
      validation: {
        method: 'Automated linting and code review'
      }
    },
    {
      statement: 'Maintain clear separation between source code, assets, and configuration',
      rationale: 'Separation makes build processes cleaner and helps with deployment and maintenance',
      implementation: 'Keep source code in src/, static assets in assets/ or public/, configuration files in root or config/',
      validation: {
        method: 'Project structure audit'
      }
    },
    {
      statement: 'Use index files for clean imports and module organization',
      rationale: 'Index files provide clean import paths and act as public APIs for modules',
      implementation: 'Create index.js/ts files in directories to export public interfaces, use barrel exports for related modules',
      validation: {
        method: 'Import path analysis and code review'
      }
    },
    {
      statement: 'Organize configuration files logically and document their purpose',
      rationale: 'Well-organized configuration makes projects easier to set up and maintain',
      implementation: 'Group related config files, use standard names, include README or comments explaining configuration',
      validation: {
        method: 'Documentation review and setup testing'
      }
    }
  ],
  examples: [
    {
      language: 'typescript',
      title: 'Modern Web Application Structure',
      goodExample: `project-root/
├── README.md
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
│
├── public/                     # Static assets served directly
│   ├── index.html
│   ├── favicon.ico
│   └── images/
│       ├── logo.svg
│       └── icons/
│
├── src/                        # Source code
│   ├── index.ts               # Application entry point
│   │
│   ├── components/            # Reusable UI components
│   │   ├── index.ts          # Barrel export
│   │   ├── Button/
│   │   │   ├── Button.ts
│   │   │   ├── Button.test.ts
│   │   │   └── index.ts
│   │   └── Modal/
│   │       ├── Modal.ts
│   │       ├── Modal.test.ts
│   │       └── index.ts
│   │
│   ├── pages/                 # Page components
│   │   ├── index.ts
│   │   ├── HomePage/
│   │   ├── AboutPage/
│   │   └── ContactPage/
│   │
│   ├── services/              # Business logic and API calls
│   │   ├── index.ts
│   │   ├── api-client.ts
│   │   ├── user-service.ts
│   │   └── auth-service.ts
│   │
│   ├── utils/                 # Helper functions
│   │   ├── index.ts
│   │   ├── date-utils.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── styles/                # Global styles
│       ├── index.css
│       ├── variables.css
│       └── components.css
│
├── tests/                     # Test utilities and integration tests
│   ├── setup.ts
│   ├── helpers/
│   └── integration/
│
├── docs/                      # Project documentation
│   ├── api.md
│   ├── deployment.md
│   └── contributing.md
│
└── config/                    # Configuration files
    ├── webpack.config.js
    ├── jest.config.js
    └── eslint.config.js

// Example index.ts files for clean imports
// src/components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export type { ButtonProps, ModalProps } from './types';

// src/services/index.ts
export { ApiClient } from './api-client';
export { UserService } from './user-service';
export { AuthService } from './auth-service';

// Usage with clean imports
import { Button, Modal } from '../components';
import { UserService, ApiClient } from '../services';`,
      badExample: `project-root/
├── index.html
├── package.json
├── app.js
├── styles.css
├── utils.js
├── config.js
├── button.js
├── modal.js
├── userService.js
├── apiClient.js
├── HomePage.js
├── AboutPage.js
├── ContactPage.js
├── test1.js
├── test2.js
├── logo.png
├── icon1.svg
├── icon2.svg
├── README.txt
└── misc/
    ├── old-code.js
    ├── backup.js
    └── temp-file.txt

// Poor import structure
import Button from './button.js';
import Modal from './modal.js';
import UserService from './userService.js';
import ApiClient from './apiClient.js';
import { formatDate, validateEmail } from './utils.js';`,
      explanation: 'The good example shows clear separation of concerns with logical grouping and clean import paths, while the bad example has everything mixed together in the root directory.'
    },
    {
      language: 'typescript',
      title: 'Component Organization Pattern',
      goodExample: `// Feature-based organization for larger applications
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   ├── LoginForm.styles.css
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── auth-service.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── user-profile/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── dashboard/
│       ├── components/
│       ├── services/
│       ├── types/
│       └── index.ts
│
├── shared/                    # Shared across features
│   ├── components/
│   │   ├── ui/               # Basic UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── index.ts
│   │   └── layout/           # Layout components
│   │       ├── Header/
│   │       ├── Footer/
│   │       └── index.ts
│   ├── services/
│   │   ├── api/
│   │   ├── storage/
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation/
│   │   ├── formatting/
│   │   └── index.ts
│   └── types/
│       ├── common.types.ts
│       └── index.ts
│
└── app/                      # App-level configuration
    ├── App.tsx
    ├── router.tsx
    ├── store.ts
    └── index.ts

// Clean feature exports
// src/features/authentication/index.ts
export { LoginForm } from './components';
export { useAuth } from './hooks';
export { AuthService } from './services';
export type { User, AuthState } from './types';

// Usage
import { LoginForm, useAuth } from '@/features/authentication';
import { Button } from '@/shared/components/ui';`,
      badExample: `// Poor organization mixing everything together
src/
├── components/
│   ├── LoginFormComponent.tsx
│   ├── UserProfileComponent.tsx
│   ├── DashboardComponent.tsx
│   ├── ButtonComponent.tsx
│   ├── InputComponent.tsx
│   ├── HeaderComponent.tsx
│   └── FooterComponent.tsx
├── services/
│   ├── AuthenticationService.tsx
│   ├── UserProfileService.tsx
│   ├── DashboardService.tsx
│   ├── ApiService.tsx
│   └── StorageService.tsx
├── utils/
│   ├── AuthUtils.tsx
│   ├── UserUtils.tsx
│   ├── DashboardUtils.tsx
│   ├── ValidationUtils.tsx
│   └── FormattingUtils.tsx
├── types/
│   ├── AuthTypes.tsx
│   ├── UserTypes.tsx
│   ├── DashboardTypes.tsx
│   └── CommonTypes.tsx
└── tests/
    ├── AuthTest.tsx
    ├── UserTest.tsx
    ├── DashboardTest.tsx
    └── UtilsTest.tsx

// Confusing imports
import LoginFormComponent from '../components/LoginFormComponent';
import AuthenticationService from '../services/AuthenticationService';
import { validateEmail } from '../utils/ValidationUtils';
import { User } from '../types/AuthTypes';`,
      explanation: 'The good example groups related functionality together by feature, making it easier to find and maintain related code, while the bad example separates by technical layer, making features harder to locate and modify.'
    }
  ],
  relatedGuidelines: ['documentation-requirements', 'javascript-standards']
};