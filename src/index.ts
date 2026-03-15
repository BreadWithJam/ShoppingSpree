/**
 * Main entry point for the AI Website Development Guide
 */

// Export types
export * from './types';

// Export model classes with explicit naming to avoid conflicts
export { GuidelineEntry as GuidelineEntryClass } from './models/GuidelineEntry';
export { Rule as RuleClass } from './models/Rule';
export { CodeExample as CodeExampleClass } from './models/CodeExample';

// Export service classes
export { GuideContentManager } from './services/GuideContentManager';
export type { GuidelineQuery } from './services/GuideContentManager';

// Export all content guidelines
export * from './content';