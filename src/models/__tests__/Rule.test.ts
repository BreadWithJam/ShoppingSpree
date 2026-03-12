import { Rule } from '../Rule';
import { Rule as IRule } from '../../types';

describe('Rule', () => {
  const validRuleData: IRule = {
    statement: 'Always validate user input',
    rationale: 'Prevents security vulnerabilities',
    implementation: 'Use input validation libraries'
  };

  describe('constructor', () => {
    it('should create a valid Rule with required fields', () => {
      const rule = new Rule(validRuleData);
      
      expect(rule.statement).toBe('Always validate user input');
      expect(rule.rationale).toBe('Prevents security vulnerabilities');
      expect(rule.implementation).toBe('Use input validation libraries');
      expect(rule.exceptions).toBeUndefined();
      expect(rule.validation).toBeUndefined();
    });

    it('should throw error for missing statement', () => {
      const invalidData = { ...validRuleData, statement: '' };
      expect(() => new Rule(invalidData)).toThrow('Rule statement is required and must be a non-empty string');
    });

    it('should throw error for missing rationale', () => {
      const invalidData = { ...validRuleData, rationale: '' };
      expect(() => new Rule(invalidData)).toThrow('Rule rationale is required and must be a non-empty string');
    });

    it('should throw error for missing implementation', () => {
      const invalidData = { ...validRuleData, implementation: '' };
      expect(() => new Rule(invalidData)).toThrow('Rule implementation is required and must be a non-empty string');
    });
  });

  describe('methods', () => {
    it('should correctly identify when rule has no exceptions', () => {
      const rule = new Rule(validRuleData);
      expect(rule.hasExceptions()).toBe(false);
    });

    it('should correctly identify when rule has no validation', () => {
      const rule = new Rule(validRuleData);
      expect(rule.hasValidation()).toBe(false);
    });
  });
});