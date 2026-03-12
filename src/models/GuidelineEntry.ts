import { GuidelineEntry as IGuidelineEntry, GuidelineCategory, Priority, Rule, CodeExample } from '../types';

/**
 * GuidelineEntry class with validation
 */
export class GuidelineEntry implements IGuidelineEntry {
  public readonly id: string;
  public readonly title: string;
  public readonly category: GuidelineCategory;
  public readonly priority: Priority;
  public readonly description: string;
  public readonly rules: Rule[];
  public readonly examples: CodeExample[];
  public readonly relatedGuidelines: string[];

  constructor(data: IGuidelineEntry) {
    this.validateInput(data);
    
    this.id = data.id;
    this.title = data.title;
    this.category = data.category;
    this.priority = data.priority;
    this.description = data.description;
    this.rules = [...data.rules];
    this.examples = [...data.examples];
    this.relatedGuidelines = [...data.relatedGuidelines];
  }

  private validateInput(data: IGuidelineEntry): void {
    if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
      throw new Error('GuidelineEntry id is required and must be a non-empty string');
    }

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('GuidelineEntry title is required and must be a non-empty string');
    }

    if (!data.category) {
      throw new Error('GuidelineEntry category is required');
    }

    if (!data.priority) {
      throw new Error('GuidelineEntry priority is required');
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      throw new Error('GuidelineEntry description is required and must be a non-empty string');
    }

    if (!Array.isArray(data.rules)) {
      throw new Error('GuidelineEntry rules must be an array');
    }

    if (!Array.isArray(data.examples)) {
      throw new Error('GuidelineEntry examples must be an array');
    }

    if (!Array.isArray(data.relatedGuidelines)) {
      throw new Error('GuidelineEntry relatedGuidelines must be an array');
    }
  }

  /**
   * Check if this guideline has any rules
   */
  public hasRules(): boolean {
    return this.rules.length > 0;
  }

  /**
   * Check if this guideline has any examples
   */
  public hasExamples(): boolean {
    return this.examples.length > 0;
  }

  /**
   * Get rules by validation method
   */
  public getRulesByValidation(method: string): Rule[] {
    return this.rules.filter(rule => rule.validation?.method === method);
  }
}