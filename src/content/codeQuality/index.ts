export { htmlBestPractices } from './htmlBestPractices';
export { cssOrganization } from './cssOrganization';
export { javascriptStandards } from './javascriptStandards';
export { projectOrganization } from './projectOrganization';
export { documentationRequirements } from './documentationRequirements';

// Export all code quality guidelines as a collection
import { htmlBestPractices } from './htmlBestPractices';
import { cssOrganization } from './cssOrganization';
import { javascriptStandards } from './javascriptStandards';
import { projectOrganization } from './projectOrganization';
import { documentationRequirements } from './documentationRequirements';

export const allCodeQualityGuidelines = [
  htmlBestPractices,
  cssOrganization,
  javascriptStandards,
  projectOrganization,
  documentationRequirements
];