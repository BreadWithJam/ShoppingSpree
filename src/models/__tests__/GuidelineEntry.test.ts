import { GuidelineEntry } from '../GuidelineEntry';
import { GuidelineEntry as IGuidelineEntry } from '../../types';

describe('GuidelineEntry', () => {
  const validGuidelineData: IGuidelineEntry = {
    id: 'test-guideline-1',
    title: 'Test Guideline',
    category: 'security',
    priority: 'critical',
    description: 'A test guideline for validation',
    rules: [],
    examples: [],
    relatedGuidelines: []
  };

  describe('constructor', () => {
    it('should create a valid GuidelineEntry with required fields', () => {
      const guideline = new GuidelineEntry(validGuidelineData);
      
      expect(guideline.id).toBe('test-guideline-1');
      expect(guideline.title).toBe('Test Guideline');
      expect(guideline.category).toBe('security');
      expect(guideline.priority).toBe('critical');
      expect(guideline.description).toBe('A test guideline for validation');
      expect(guideline.rules).toEqual([]);
      expect(guideline.examples).toEqual([]);
      expect(guideline.relatedGuidelines).toEqual([]);
    });

    it('should throw error for missing id', () => {
      const invalidData = { ...validGuidelineData, id: '' };
      expect(() => new GuidelineEntry(invalidData)).toThrow('GuidelineEntry id is required and must be a non-empty string');
    });

    it('should throw error for missing title', () => {
      const invalidData = { ...validGuidelineData, title: '' };
      expect(() => new GuidelineEntry(invalidData)).toThrow('GuidelineEntry title is required and must be a non-empty string');
    });

    it('should throw error for missing description', () => {
      const invalidData = { ...validGuidelineData, description: '' };
      expect(() => new GuidelineEntry(invalidData)).toThrow('GuidelineEntry description is required and must be a non-empty string');
    });
  });

  describe('methods', () => {
    it('should correctly identify when guideline has no rules', () => {
      const guideline = new GuidelineEntry(validGuidelineData);
      expect(guideline.hasRules()).toBe(false);
    });

    it('should correctly identify when guideline has no examples', () => {
      const guideline = new GuidelineEntry(validGuidelineData);
      expect(guideline.hasExamples()).toBe(false);
    });
  });
});