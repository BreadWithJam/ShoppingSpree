/**
 * Testing and Validation Guidelines
 * Comprehensive testing strategies, validation procedures, and quality assurance practices
 */

export { testingStrategyGuidelines } from './testingStrategy';
export { markupValidationGuidelines } from './markupValidation';
export { compatibilityTestingGuidelines } from './compatibilityTesting';
export { deploymentValidationGuidelines } from './deploymentValidation';
export { automatedTestingGuidelines } from './automatedTesting';

// Export all testing guidelines as a collection
import { testingStrategyGuidelines } from './testingStrategy';
import { markupValidationGuidelines } from './markupValidation';
import { compatibilityTestingGuidelines } from './compatibilityTesting';
import { deploymentValidationGuidelines } from './deploymentValidation';
import { automatedTestingGuidelines } from './automatedTesting';

export const allTestingGuidelines = [
  testingStrategyGuidelines,
  markupValidationGuidelines,
  compatibilityTestingGuidelines,
  deploymentValidationGuidelines,
  automatedTestingGuidelines
];