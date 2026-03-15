export { assetOptimizationGuidelines } from './assetOptimization';
export { responsiveDesignGuidelines } from './responsiveDesign';
export { mediaHandlingGuidelines } from './mediaHandling';
export { codeOptimizationGuidelines } from './codeOptimization';
export { performanceMonitoringGuidelines } from './performanceMonitoring';

// Export all performance guidelines as a collection
import { assetOptimizationGuidelines } from './assetOptimization';
import { responsiveDesignGuidelines } from './responsiveDesign';
import { mediaHandlingGuidelines } from './mediaHandling';
import { codeOptimizationGuidelines } from './codeOptimization';
import { performanceMonitoringGuidelines } from './performanceMonitoring';

export const allPerformanceGuidelines = [
  assetOptimizationGuidelines,
  responsiveDesignGuidelines,
  mediaHandlingGuidelines,
  codeOptimizationGuidelines,
  performanceMonitoringGuidelines
];