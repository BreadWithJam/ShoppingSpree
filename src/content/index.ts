/**
 * AI Website Development Guide Content
 * Comprehensive collection of all guidelines organized by category
 */

// Security Guidelines
export * from './security';

// Code Quality Guidelines  
export * from './codeQuality';

// Architecture Guidelines
export * from './architecture';

// Performance Guidelines
export * from './performance';

// Accessibility Guidelines
export * from './accessibility';

// Testing Guidelines
export * from './testing';

// Collect all guidelines by category
import { allSecurityGuidelines } from './security';
import { allCodeQualityGuidelines } from './codeQuality';
import { allArchitectureGuidelines } from './architecture';
import { allPerformanceGuidelines } from './performance';
import { allAccessibilityGuidelines } from './accessibility';
import { allTestingGuidelines } from './testing';

export const allGuidelines = {
  security: allSecurityGuidelines,
  codeQuality: allCodeQualityGuidelines,
  architecture: allArchitectureGuidelines,
  performance: allPerformanceGuidelines,
  accessibility: allAccessibilityGuidelines,
  testing: allTestingGuidelines
};

// Flat array of all guidelines
export const allGuidelinesFlat = [
  ...allSecurityGuidelines,
  ...allCodeQualityGuidelines,
  ...allArchitectureGuidelines,
  ...allPerformanceGuidelines,
  ...allAccessibilityGuidelines,
  ...allTestingGuidelines
];