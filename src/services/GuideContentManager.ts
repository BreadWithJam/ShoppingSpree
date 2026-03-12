import { GuidelineEntry } from '../models/GuidelineEntry';
import { GuidelineCategory, Priority } from '../types';
import {
  inputValidationGuidelines,
  authenticationGuidelines,
  dataProtectionGuidelines,
  serverConfigurationGuidelines,
  owaspPreventionGuidelines
} from '../content/security';
import {
  htmlBestPractices,
  cssOrganization,
  javascriptStandards,
  projectOrganization,
  documentationRequirements
} from '../content/codeQuality';

/**
 * Query interface for retrieving guidelines
 */
export interface GuidelineQuery {
  category?: GuidelineCategory;
  priority?: Priority;
  keywords?: string[];
  topic?: string;
}

/**
 * Content management system for storing and organizing guidelines
 */
export class GuideContentManager {
  private guidelines: Map<string, GuidelineEntry> = new Map();
  private categoryIndex: Map<GuidelineCategory, Set<string>> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();

  constructor() {
    // Initialize category index
    const categories: GuidelineCategory[] = ['security', 'code-quality', 'architecture', 'performance', 'accessibility', 'testing'];
    categories.forEach(category => {
      this.categoryIndex.set(category, new Set());
    });

    // Add security guidelines
    this.addGuideline(inputValidationGuidelines);
    this.addGuideline(authenticationGuidelines);
    this.addGuideline(dataProtectionGuidelines);
    this.addGuideline(serverConfigurationGuidelines);
    this.addGuideline(owaspPreventionGuidelines);

    // Add code quality guidelines
    this.addGuideline(htmlBestPractices);
    this.addGuideline(cssOrganization);
    this.addGuideline(javascriptStandards);
    this.addGuideline(projectOrganization);
    this.addGuideline(documentationRequirements);
  }

  /**
   * Add a guideline to the content management system
   */
  public addGuideline(guideline: GuidelineEntry): void {
    this.guidelines.set(guideline.id, guideline);
    
    // Update category index
    const categorySet = this.categoryIndex.get(guideline.category);
    if (categorySet) {
      categorySet.add(guideline.id);
    }

    // Update keyword index
    this.indexKeywords(guideline);
  }

  /**
   * Remove a guideline from the content management system
   */
  public removeGuideline(id: string): boolean {
    const guideline = this.guidelines.get(id);
    if (!guideline) {
      return false;
    }

    this.guidelines.delete(id);
    
    // Update category index
    const categorySet = this.categoryIndex.get(guideline.category);
    if (categorySet) {
      categorySet.delete(id);
    }

    // Update keyword index
    this.removeFromKeywordIndex(guideline);
    
    return true;
  }

  /**
   * Get a guideline by ID
   */
  public getGuideline(id: string): GuidelineEntry | undefined {
    return this.guidelines.get(id);
  }

  /**
   * Get all guidelines
   */
  public getAllGuidelines(): GuidelineEntry[] {
    return Array.from(this.guidelines.values());
  }

  /**
   * Query guidelines based on criteria
   */
  public queryGuidelines(query: GuidelineQuery): GuidelineEntry[] {
    let candidateIds: Set<string> = new Set(this.guidelines.keys());

    // Filter by category
    if (query.category) {
      const categoryIds = this.categoryIndex.get(query.category);
      if (categoryIds) {
        candidateIds = new Set([...candidateIds].filter(id => categoryIds.has(id)));
      } else {
        return [];
      }
    }

    // Filter by keywords
    if (query.keywords && query.keywords.length > 0) {
      const keywordMatches = new Set<string>();
      query.keywords.forEach(keyword => {
        const keywordIds = this.keywordIndex.get(keyword.toLowerCase());
        if (keywordIds) {
          keywordIds.forEach(id => keywordMatches.add(id));
        }
      });
      candidateIds = new Set([...candidateIds].filter(id => keywordMatches.has(id)));
    }

    // Filter by topic (search in title and description)
    if (query.topic) {
      const topicLower = query.topic.toLowerCase();
      candidateIds = new Set([...candidateIds].filter(id => {
        const guideline = this.guidelines.get(id);
        if (!guideline) return false;
        return guideline.title.toLowerCase().includes(topicLower) ||
               guideline.description.toLowerCase().includes(topicLower);
      }));
    }

    // Get guidelines and filter by priority
    let results = [...candidateIds]
      .map(id => this.guidelines.get(id))
      .filter((guideline): guideline is GuidelineEntry => guideline !== undefined);

    if (query.priority) {
      results = results.filter(guideline => guideline.priority === query.priority);
    }

    return results;
  }

  /**
   * Get guidelines by category
   */
  public getGuidelinesByCategory(category: GuidelineCategory): GuidelineEntry[] {
    return this.queryGuidelines({ category });
  }

  /**
   * Search guidelines by keywords
   */
  public searchGuidelines(keywords: string[]): GuidelineEntry[] {
    return this.queryGuidelines({ keywords });
  }

  /**
   * Get total number of guidelines
   */
  public getGuidelineCount(): number {
    return this.guidelines.size;
  }

  /**
   * Get guidelines count by category
   */
  public getGuidelineCountByCategory(): Map<GuidelineCategory, number> {
    const counts = new Map<GuidelineCategory, number>();
    this.categoryIndex.forEach((ids, category) => {
      counts.set(category, ids.size);
    });
    return counts;
  }

  /**
   * Index keywords from a guideline for search
   */
  private indexKeywords(guideline: GuidelineEntry): void {
    const keywords = this.extractKeywords(guideline);
    keywords.forEach(keyword => {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword)!.add(guideline.id);
    });
  }

  /**
   * Remove guideline from keyword index
   */
  private removeFromKeywordIndex(guideline: GuidelineEntry): void {
    const keywords = this.extractKeywords(guideline);
    keywords.forEach(keyword => {
      const keywordSet = this.keywordIndex.get(keyword);
      if (keywordSet) {
        keywordSet.delete(guideline.id);
        if (keywordSet.size === 0) {
          this.keywordIndex.delete(keyword);
        }
      }
    });
  }

  /**
   * Extract keywords from a guideline for indexing
   */
  private extractKeywords(guideline: GuidelineEntry): string[] {
    const keywords: string[] = [];
    
    // Extract from title and description
    const text = `${guideline.title} ${guideline.description}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    keywords.push(...words);

    // Extract from rules
    guideline.rules.forEach(rule => {
      const ruleText = `${rule.statement} ${rule.rationale}`.toLowerCase();
      const ruleWords = ruleText.split(/\s+/).filter(word => word.length > 2);
      keywords.push(...ruleWords);
    });

    // Extract from examples
    guideline.examples.forEach(example => {
      const exampleText = `${example.title} ${example.explanation}`.toLowerCase();
      const exampleWords = exampleText.split(/\s+/).filter(word => word.length > 2);
      keywords.push(...exampleWords);
    });

    // Remove duplicates and common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with']);
    
    return [...new Set(keywords)].filter(keyword => !stopWords.has(keyword));
  }
}