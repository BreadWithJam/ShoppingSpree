module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/js'],
  testMatch: [
    '**/__tests__/**/*.ts', 
    '**/?(*.)+(spec|test).ts',
    '**/__tests__/**/*.js', 
    '**/?(*.)+(spec|test).js'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    'js/**/*.js',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!js/**/*.test.js',
    '!js/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};