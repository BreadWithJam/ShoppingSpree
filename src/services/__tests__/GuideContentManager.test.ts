import { GuideContentManager } from '../GuideContentManager';
import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';
import { GuidelineEntry as IGuidelineEntry } from '../../types';

describe('GuideContentManager', () => {
  let manager: GuideContentManager;
  let sampleGuideline: GuidelineEntry;
  let initialGuidelineCount: number;

  beforeEach(() => {
    manager = new GuideContentManager();
    initialGuidelineCount = manager.getGuidelineCount(); // Get the initial count of pre-loaded guidelines
    
    const guidelineData: IGuidelineEntry = {
      id: 'test-security-input-validation',
      title: 'Test Input Validation Guidelines',
      category: 'security',
      priority: 'critical',
      description: 'Test guidelines for validating user input to prevent security vulnerabilities',
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
      
      expect(manager.getGuidelineCount()).toBe(initialGuidelineCount + 1);
      expect(manager.getGuideline('test-security-input-validation')).toBe(sampleGuideline);
    });

    it('should index guideline by category', () => {
      const initialSecurityCount = manager.getGuidelinesByCategory('security').length;
      manager.addGuideline(sampleGuideline);
      
      const securityGuidelines = manager.getGuidelinesByCategory('security');
      expect(securityGuidelines).toHaveLength(initialSecurityCount + 1);
      expect(securityGuidelines.find(g => g.id === 'test-security-input-validation')).toBe(sampleGuideline);
    });
  });

  describe('removeGuideline', () => {
    it('should remove a guideline from the manager', () => {
      manager.addGuideline(sampleGuideline);
      expect(manager.getGuidelineCount()).toBe(initialGuidelineCount + 1);
      
      const removed = manager.removeGuideline('test-security-input-validation');
      expect(removed).toBe(true);
      expect(manager.getGuidelineCount()).toBe(initialGuidelineCount);
      expect(manager.getGuideline('test-security-input-validation')).toBeUndefined();
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
        id: 'test-performance-caching',
        title: 'Test Caching Strategies',
        category: 'performance',
        priority: 'recommended',
        description: 'Test guidelines for implementing effective caching',
        rules: [],
        examples: [],
        relatedGuidelines: []
      });
      manager.addGuideline(performanceGuideline);
    });

    it('should query by category', () => {
      const results = manager.queryGuidelines({ category: 'security' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.find(r => r.id === 'test-security-input-validation')).toBeDefined();
    });

    it('should query by priority', () => {
      const results = manager.queryGuidelines({ priority: 'critical' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.find(r => r.id === 'test-security-input-validation')).toBeDefined();
    });

    it('should query by topic', () => {
      const results = manager.queryGuidelines({ topic: 'Test Input Validation' });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-security-input-validation');
    });

    it('should query by keywords', () => {
      const results = manager.queryGuidelines({ keywords: ['test', 'input', 'validation'] });
      expect(results.length).toBeGreaterThan(0);
      expect(results.find(r => r.id === 'test-security-input-validation')).toBeDefined();
    });

    it('should combine multiple query criteria', () => {
      const results = manager.queryGuidelines({ 
        category: 'security', 
        priority: 'critical',
        topic: 'Test Input Validation'
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-security-input-validation');
    });

    it('should return empty array when no matches found', () => {
      const results = manager.queryGuidelines({ topic: 'nonexistent-topic-that-does-not-exist' });
      expect(results).toHaveLength(0);
    });
  });

  describe('searchGuidelines', () => {
    it('should search guidelines by keywords', () => {
      manager.addGuideline(sampleGuideline);
      
      const results = manager.searchGuidelines(['test', 'validation']);
      expect(results.length).toBeGreaterThan(0);
      expect(results.find(r => r.id === 'test-security-input-validation')).toBeDefined();
    });
  });

  describe('getGuidelineCountByCategory', () => {
    it('should return correct counts by category', () => {
      const initialSecurityCount = manager.getGuidelinesByCategory('security').length;
      manager.addGuideline(sampleGuideline);
      
      const counts = manager.getGuidelineCountByCategory();
      expect(counts.get('security')).toBe(initialSecurityCount + 1);
    });
  });
});