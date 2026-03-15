export { wcagStandards } from './wcagStandards';
export { interactiveAccessibility } from './interactiveAccessibility';
export { visualAccessibility } from './visualAccessibility';
export { multimediaAccessibility } from './multimediaAccessibility';
export { inclusiveDesign } from './inclusiveDesign';

// Export all accessibility guidelines as a collection
import { wcagStandards } from './wcagStandards';
import { interactiveAccessibility } from './interactiveAccessibility';
import { visualAccessibility } from './visualAccessibility';
import { multimediaAccessibility } from './multimediaAccessibility';
import { inclusiveDesign } from './inclusiveDesign';

export const allAccessibilityGuidelines = [
  wcagStandards,
  interactiveAccessibility,
  visualAccessibility,
  multimediaAccessibility,
  inclusiveDesign
];