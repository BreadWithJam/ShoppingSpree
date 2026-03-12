import { GuideContentManager } from '../GuideContentManager';
import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';
import { GuidelineEntry as IGuidelineEntry } from '../../types';

describe('GuideContentManager', () => {
  let manager: GuideContentManager;
  let sampleGuideline: GuidelineEntry;

  beforeEach(() => {
    manager = new GuideContentManager();
    
    const guidelineData: IGuidelineEntry = {
      id: 'security-input-validation',
      title: 'Input Validation Guidelines',
      category: 'security',
      priority: 'critical',
      description: 'Guidelines for validating user input to prevent security vulnerabilities',
      rules: [
        new Rule({
          statement: 'Always validate user input',
          rationale: 'Prevents injection attacks',
          implementation: 'Use validation libraries'
        })
      ],
      examples: [
        new CodeExample({
          language: 'javascript',
          title: 'Input validation example',
          goodExample: 'const isValid = validator.isEmail(input);',
          explanation: 'Validates email input'
        })
      ],
      relatedGuidelines: ['security-sanitization']
    };
    
    sampleGuideline = new GuidelineEntry(guidelineData);
  });

  describe('addGuideline', () => {
    it('should add a guideline to the manager', () => {
      manager.addGuideline(sampleGuideline);
      
      expect(manager.getGuidelineCount()).toBe(1);
      expect(manager.getGuideline('security-input-validation')).toBe(sampleGuideline);
    });

    it('should index guideline by category', () => {
      manager.addGuideline(sampleGuideline);
      
      const securityGuidelines = manager.getGuidelinesByCategory('security');
      expect(securityGuidelines).toHaveLength(1);
      expect(securityGuidelines[0]).toBe(sampleGuideline);
    });
  });

  describe('removeGuideline', () => {
    it('should remove a guideline from the manager', () => {
      manager.addGuideline(sampleGuideline);
      expect(manager.getGuidelineCount()).toBe(1);
      
      const removed = manager.removeGuideline('security-input-validation');
      expect(removed).toBe(true);
      expect(manager.getGuidelineCount()).toBe(0);
      expect(manager.getGuideline('security-input-validation')).toBeUndefined();
    });

    it('should return false when removing non-existent guideline', () => {
      const removed = manager.removeGuideline('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('queryGuidelines', () => {
    beforeEach(() => {
      manager.addGuideline(sampleGuideline);
      
      // Add another guideline for testing
      const performanceGuideline = new GuidelineEntry({
        id: 'performance-caching',
        title: 'Caching Strategies',
        category: 'performance',
        priority: 'recommended',
        description: 'Guidelines for implementing effective caching',
        rules: [],
        examples: [],
        relatedGuidelines: []
      });
      manager.addGuideline(performanceGuideline);
    });

    it('should query by category', () => {
      const results = manager.queryGuidelines({ category: 'security' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });

    it('should query by priority', () => {
      const results = manager.queryGuidelines({ priority: 'critical' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });

    it('should query by topic', () => {
      const results = manager.queryGuidelines({ topic: 'validation' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });

    it('should query by keywords', () => {
      const results = manager.queryGuidelines({ keywords: ['input', 'validation'] });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });

    it('should combine multiple query criteria', () => {
      const results = manager.queryGuidelines({ 
        category: 'security', 
        priority: 'critical',
        topic: 'validation'
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });

    it('should return empty array when no matches found', () => {
      const results = manager.queryGuidelines({ category: 'accessibility' });
      expect(results).toHaveLength(0);
    });
  });

  describe('searchGuidelines', () => {
    it('should search guidelines by keywords', () => {
      manager.addGuideline(sampleGuideline);
      
      const results = manager.searchGuidelines(['validation']);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-input-validation');
    });
  });

  describe('getGuidelineCountByCategory', () => {
    it('should return correct counts by category', () => {
      manager.addGuideline(sampleGuideline);
      
      const counts = manager.getGuidelineCountByCategory();
      expect(counts.get('security')).toBe(1);
      expect(counts.get('performance')).toBe(0);
    });
  });
});