import { GuidelineEntry } from '../models/GuidelineEntry';
import { GuideContentManager, GuidelineQuery } from './GuideContentManager';
import { GuidelineCategory, Priority } from '../types';

/**
 * Advanced search query interface
 */
export interface AdvancedSearchQuery extends GuidelineQuery {
  searchText?: string;
  includeRules?: boolean;
  includeExamples?: boolean;
  sortBy?: 'relevance' | 'priority' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  guideline: GuidelineEntry;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Search results container
 */
export interface SearchResults {
  results: SearchResult[];
  totalCount: number;
  query: AdvancedSearchQuery;
  executionTime: number;
}

/**
 * Filter options for faceted search
 */
export interface FilterOptions {
  categories: { category: GuidelineCategory; count: number }[];
  priorities: { priority: Priority; count: number }[];
  availableKeywords: string[];
}

/**
 * Advanced search and filtering service for guidelines
 */
export class GuideSearchService {
  constructor(private contentManager: GuideContentManager) {}

  /**
   * Perform advanced search with relevance scoring
   */
  public search(query: AdvancedSearchQuery): SearchResults {
    const startTime = performance.now();
    
    // Get base results from content manager
    let guidelines = this.contentManager.queryGuidelines(query);
    let searchResults: SearchResult[];
    
    // Apply text search if specified
    if (query.searchText && query.searchText.trim().length > 0) {
      searchResults = this.performTextSearch(guidelines, query.searchText, query);
    } else {
      // Convert guidelines to search results without text scoring
      searchResults = guidelines.map(guideline => ({
        guideline,
        relevanceScore: 0,
        matchedFields: []
      }));
    }

    // Sort results
    const sortedResults = this.sortResults(searchResults, query);
    
    // Apply pagination
    const paginatedResults = this.applyPagination(sortedResults, query);
    
    const executionTime = Math.max(1, Math.round(performance.now() - startTime));
    
    return {
      results: paginatedResults,
      totalCount: sortedResults.length,
      query,
      executionTime
    };
  }

  /**
   * Get filter options for faceted search
   */
  public getFilterOptions(currentQuery?: AdvancedSearchQuery): FilterOptions {
    const allGuidelines = this.contentManager.getAllGuidelines();
    
    // If there's a current query, apply it to get filtered results
    let filteredGuidelines = allGuidelines;
    if (currentQuery) {
      const results = this.search(currentQuery);
      filteredGuidelines = results.results.map(r => r.guideline);
    }

    // Count categories
    const categoryCount = new Map<GuidelineCategory, number>();
    const priorityCount = new Map<Priority, number>();
    const keywordSet = new Set<string>();

    filteredGuidelines.forEach(guideline => {
      // Count categories
      categoryCount.set(guideline.category, (categoryCount.get(guideline.category) || 0) + 1);
      
      // Count priorities
      priorityCount.set(guideline.priority, (priorityCount.get(guideline.priority) || 0) + 1);
      
      // Collect keywords
      this.extractKeywords(guideline).forEach(keyword => keywordSet.add(keyword));
    });

    return {
      categories: Array.from(categoryCount.entries()).map(([category, count]) => ({ category, count })),
      priorities: Array.from(priorityCount.entries()).map(([priority, count]) => ({ priority, count })),
      availableKeywords: Array.from(keywordSet).sort()
    };
  }

  /**
   * Search for similar guidelines based on content
   */
  public findSimilar(guidelineId: string, limit: number = 5): GuidelineEntry[] {
    const targetGuideline = this.contentManager.getGuideline(guidelineId);
    if (!targetGuideline) {
      return [];
    }

    const allGuidelines = this.contentManager.getAllGuidelines()
      .filter(g => g.id !== guidelineId);

    // Calculate similarity scores
    const similarities = allGuidelines.map(guideline => ({
      guideline,
      similarity: this.calculateSimilarity(targetGuideline, guideline)
    }));

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.guideline);
  }

  /**
   * Get autocomplete suggestions for search text
   */
  public getAutocompleteSuggestions(partialText: string, limit: number = 10): string[] {
    if (!partialText || partialText.length < 2) {
      return [];
    }

    const allGuidelines = this.contentManager.getAllGuidelines();
    const suggestions = new Set<string>();

    allGuidelines.forEach(guideline => {
      // Check title words
      const titleWords = guideline.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.startsWith(partialText.toLowerCase()) && word.length > partialText.length) {
          suggestions.add(word);
        }
      });

      // Check keywords
      this.extractKeywords(guideline).forEach(keyword => {
        if (keyword.startsWith(partialText.toLowerCase()) && keyword.length > partialText.length) {
          suggestions.add(keyword);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit).sort();
  }

  /**
   * Perform text search with relevance scoring
   */
  private performTextSearch(guidelines: GuidelineEntry[], searchText: string, query: AdvancedSearchQuery): SearchResult[] {
    const searchTerms = searchText.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    const results = guidelines.map(guideline => {
      const { score, matchedFields } = this.calculateRelevanceScore(guideline, searchTerms, query);
      return {
        guideline,
        relevanceScore: score,
        matchedFields
      };
    }).filter(result => result.relevanceScore > 0);

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate relevance score for a guideline against search terms
   */
  private calculateRelevanceScore(guideline: GuidelineEntry, searchTerms: string[], query: AdvancedSearchQuery): { score: number; matchedFields: string[] } {
    let score = 0;
    const matchedFields: string[] = [];

    // Title matches (highest weight)
    const titleMatches = this.countMatches(guideline.title.toLowerCase(), searchTerms);
    if (titleMatches > 0) {
      score += titleMatches * 10;
      matchedFields.push('title');
    }

    // Description matches
    const descriptionMatches = this.countMatches(guideline.description.toLowerCase(), searchTerms);
    if (descriptionMatches > 0) {
      score += descriptionMatches * 5;
      matchedFields.push('description');
    }

    // Rule matches (if enabled)
    if (query.includeRules !== false) {
      guideline.rules.forEach(rule => {
        const ruleMatches = this.countMatches(`${rule.statement} ${rule.rationale}`.toLowerCase(), searchTerms);
        if (ruleMatches > 0) {
          score += ruleMatches * 3;
          if (!matchedFields.includes('rules')) {
            matchedFields.push('rules');
          }
        }
      });
    }

    // Example matches (if enabled)
    if (query.includeExamples !== false) {
      guideline.examples.forEach(example => {
        const exampleMatches = this.countMatches(`${example.title} ${example.explanation}`.toLowerCase(), searchTerms);
        if (exampleMatches > 0) {
          score += exampleMatches * 2;
          if (!matchedFields.includes('examples')) {
            matchedFields.push('examples');
          }
        }
      });
    }

    // Priority boost
    const priorityBoost = { critical: 3, recommended: 2, optional: 1 };
    score += priorityBoost[guideline.priority];

    return { score, matchedFields };
  }

  /**
   * Count matches of search terms in text
   */
  private countMatches(text: string, searchTerms: string[]): number {
    return searchTerms.reduce((count, term) => {
      const matches = (text.match(new RegExp(term, 'g')) || []).length;
      return count + matches;
    }, 0);
  }

  /**
   * Sort search results based on criteria
   */
  private sortResults(results: SearchResult[], query: AdvancedSearchQuery): SearchResult[] {
    const sortBy = query.sortBy || 'relevance';
    const sortOrder = query.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.guideline.title.localeCompare(b.guideline.title);
          break;
        case 'category':
          comparison = a.guideline.category.localeCompare(b.guideline.category);
          break;
        case 'priority':
          const priorityOrder = { critical: 3, recommended: 2, optional: 1 };
          comparison = priorityOrder[b.guideline.priority] - priorityOrder[a.guideline.priority];
          break;
        case 'relevance':
        default:
          comparison = b.relevanceScore - a.relevanceScore;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }

  /**
   * Apply pagination to results
   */
  private applyPagination(results: SearchResult[], query: AdvancedSearchQuery): SearchResult[] {
    const offset = query.offset || 0;
    const limit = query.limit || results.length;
    
    return results.slice(offset, offset + limit);
  }

  /**
   * Calculate similarity between two guidelines
   */
  private calculateSimilarity(guideline1: GuidelineEntry, guideline2: GuidelineEntry): number {
    let similarity = 0;

    // Category match
    if (guideline1.category === guideline2.category) {
      similarity += 0.3;
    }

    // Priority match
    if (guideline1.priority === guideline2.priority) {
      similarity += 0.1;
    }

    // Related guidelines
    if (guideline1.relatedGuidelines.includes(guideline2.id) || 
        guideline2.relatedGuidelines.includes(guideline1.id)) {
      similarity += 0.4;
    }

    // Keyword overlap
    const keywords1 = new Set(this.extractKeywords(guideline1));
    const keywords2 = new Set(this.extractKeywords(guideline2));
    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);
    
    if (union.size > 0) {
      similarity += (intersection.size / union.size) * 0.2;
    }

    return similarity;
  }

  /**
   * Extract keywords from a guideline
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

    // Remove duplicates and common stop words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with']);
    
    return [...new Set(keywords)].filter(keyword => !stopWords.has(keyword));
  }
}