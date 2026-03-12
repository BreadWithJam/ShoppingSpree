/**
 * Core type definitions for the AI Website Development Guide
 */

export type GuidelineCategory = 
  | 'security'
  | 'code-quality'
  | 'architecture'
  | 'performance'
  | 'accessibility'
  | 'testing';

export type Priority = 'critical' | 'recommended' | 'optional';

export type CodeLanguage = 'html' | 'css' | 'javascript' | 'typescript';

/**
 * Validation criteria for rules
 */
export interface ValidationCriteria {
  method: string;
  tools?: string[];
  automated?: boolean;
}

/**
 * Code example demonstrating best practices
 */
export interface CodeExample {
  language: CodeLanguage;
  title: string;
  goodExample: string;
  badExample?: string;
  explanation: string;
}

/**
 * Individual rule within a guideline
 */
export interface Rule {
  statement: string;
  rationale: string;
  implementation: string;
  exceptions?: string[];
  validation?: ValidationCriteria;
}

/**
 * Main guideline entry containing rules and examples
 */
export interface GuidelineEntry {
  id: string;
  title: string;
  category: GuidelineCategory;
  priority: Priority;
  description: string;
  rules: Rule[];
  examples: CodeExample[];
  relatedGuidelines: string[];
}