export { inputValidationGuidelines } from './inputValidation';
export { authenticationGuidelines } from './authentication';
export { dataProtectionGuidelines } from './dataProtection';
export { serverConfigurationGuidelines } from './serverConfiguration';
export { owaspPreventionGuidelines } from './owaspPrevention';

// Export all security guidelines as a collection
import { inputValidationGuidelines } from './inputValidation';
import { authenticationGuidelines } from './authentication';
import { dataProtectionGuidelines } from './dataProtection';
import { serverConfigurationGuidelines } from './serverConfiguration';
import { owaspPreventionGuidelines } from './owaspPrevention';

export const allSecurityGuidelines = [
  inputValidationGuidelines,
  authenticationGuidelines,
  dataProtectionGuidelines,
  serverConfigurationGuidelines,
  owaspPreventionGuidelines
];