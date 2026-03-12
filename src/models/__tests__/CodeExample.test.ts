import { CodeExample } from '../CodeExample';
import { CodeExample as ICodeExample } from '../../types';

describe('CodeExample', () => {
  const validExampleData: ICodeExample = {
    language: 'javascript',
    title: 'Input Validation Example',
    goodExample: 'const isValid = validateInput(userInput);',
    explanation: 'This example shows proper input validation'
  };

  describe('constructor', () => {
    it('should create a valid CodeExample with required fields', () => {
      const example = new CodeExample(validExampleData);
      
      expect(example.language).toBe('javascript');
      expect(example.title).toBe('Input Validation Example');
      expect(example.goodExample).toBe('const isValid = validateInput(userInput);');
      expect(example.explanation).toBe('This example shows proper input validation');
      expect(example.badExample).toBeUndefined();
    });

    it('should throw error for missing title', () => {
      const invalidData = { ...validExampleData, title: '' };
      expect(() => new CodeExample(invalidData)).toThrow('CodeExample title is required and must be a non-empty string');
    });

    it('should throw error for missing goodExample', () => {
      const invalidData = { ...validExampleData, goodExample: '' };
      expect(() => new CodeExample(invalidData)).toThrow('CodeExample goodExample is required and must be a non-empty string');
    });

    it('should throw error for missing explanation', () => {
      const invalidData = { ...validExampleData, explanation: '' };
      expect(() => new CodeExample(invalidData)).toThrow('CodeExample explanation is required and must be a non-empty string');
    });
  });

  describe('methods', () => {
    it('should correctly identify when example has no bad example', () => {
      const example = new CodeExample(validExampleData);
      expect(example.hasBadExample()).toBe(false);
    });

    it('should correctly identify language', () => {
      const example = new CodeExample(validExampleData);
      expect(example.isLanguage('javascript')).toBe(true);
      expect(example.isLanguage('html')).toBe(false);
    });
  });
});