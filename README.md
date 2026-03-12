# AI Website Development Guide

A comprehensive reference document that provides AI assistants with structured guidelines for building secure, clean, and well-architected websites.

## Project Structure

```
├── src/
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts     # Core interfaces and types
│   ├── models/          # Data model classes with validation
│   │   ├── GuidelineEntry.ts  # Main guideline entry class
│   │   ├── Rule.ts            # Rule definition class
│   │   ├── CodeExample.ts     # Code example class
│   │   ├── index.ts           # Model exports
│   │   └── __tests__/         # Unit and property-based tests
│   └── index.ts         # Main entry point
├── dist/                # Compiled JavaScript output
├── coverage/            # Test coverage reports
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest testing configuration
└── README.md           # This file
```

## Core Interfaces

### GuidelineEntry
Main container for guidelines with validation, rules, examples, and related guidelines.

### Rule
Individual rules within guidelines with statements, rationale, implementation details, and validation criteria.

### CodeExample
Code examples demonstrating best practices with good/bad examples and explanations.

## Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Testing Framework
- **Jest** for unit testing
- **fast-check** for property-based testing
- All property-based tests run 100 iterations minimum
- Tests validate both specific examples and universal properties

## Features

- TypeScript interfaces for structured guideline content
- Comprehensive validation for all data models
- Property-based testing for robust validation
- Modular architecture for easy extension
- Full test coverage with both unit and property tests