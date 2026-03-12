import { Rule as IRule, ValidationCriteria } from '../types';

/**
 * Rule class with validation
 */
export class Rule implements IRule {
  public readonly statement: string;
  public readonly rationale: string;
  public readonly implementation: string;
  public readonly exceptions?: string[];
  public readonly validation?: ValidationCriteria;

  constructor(data: IRule) {
    this.validateInput(data);
    
    this.statement = data.statement;
    this.rationale = data.rationale;
    this.implementation = data.implementation;
    this.exceptions = data.exceptions ? [...data.exceptions] : undefined;
    this.validation = data.validation ? { ...data.validation } : undefined;
  }

  private validateInput(data: IRule): void {
    if (!data.statement || typeof data.statement !== 'string' || data.statement.trim().length === 0) {
      throw new Error('Rule statement is required and must be a non-empty string');
    }

    if (!data.rationale || typeof data.rationale !== 'string' || data.rationale.trim().length === 0) {
      throw new Error('Rule rationale is required and must be a non-empty string');
    }

    if (!data.implementation || typeof data.implementation !== 'string' || data.implementation.trim().length === 0) {
      throw new Error('Rule implementation is required and must be a non-empty string');
    }

    if (data.exceptions && !Array.isArray(data.exceptions)) {
      throw new Error('Rule exceptions must be an array if provided');
    }

    if (data.validation) {
      if (!data.validation.method || typeof data.validation.method !== 'string') {
        throw new Error('Validation method is required and must be a string');
      }
    }
  }

  /**
   * Check if this rule has exceptions
   */
  public hasExceptions(): boolean {
    return Boolean(this.exceptions && this.exceptions.length > 0);
  }

  /**
   * Check if this rule has validation criteria
   */
  public hasValidation(): boolean {
    return Boolean(this.validation);
  }

  /**
   * Check if validation is automated
   */
  public isAutomatedValidation(): boolean {
    return Boolean(this.validation?.automated);
  }
}