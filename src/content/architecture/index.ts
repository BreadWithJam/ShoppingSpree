export { componentOrganizationGuidelines } from './componentOrganization';
export { dataFlowGuidelines } from './dataFlow';
export { modularityGuidelines } from './modularity';
export { performanceArchitectureGuidelines } from './performanceArchitecture';
export { technologyIntegrationGuidelines } from './technologyIntegration';

// Export all architecture guidelines as a collection
import { componentOrganizationGuidelines } from './componentOrganization';
import { dataFlowGuidelines } from './dataFlow';
import { modularityGuidelines } from './modularity';
import { performanceArchitectureGuidelines } from './performanceArchitecture';
import { technologyIntegrationGuidelines } from './technologyIntegration';

export const allArchitectureGuidelines = [
  componentOrganizationGuidelines,
  dataFlowGuidelines,
  modularityGuidelines,
  performanceArchitectureGuidelines,
  technologyIntegrationGuidelines
];