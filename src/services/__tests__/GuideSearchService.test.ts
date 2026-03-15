import { GuideSearchService, AdvancedSearchQuery } from '../GuideSearchService';
import { GuideContentManager } from '../GuideContentManager';
import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';

describe('GuideSearchService', () => {
  let searchService: GuideSearchService;
  let contentManager: GuideContentManager;
  let testGuidelines: GuidelineEntry[];

  beforeEach(() => {
    contentManager = new GuideContentManager();
    searchService = new GuideSearchService(contentManager);

    // Create test guidelines
    testGuidelines = [
      new GuidelineEntry({
        id: 'test-security-auth',
        title: 'Authentication Security Guidelines',
        category: 'security',
        priority: 'critical',
        description: 'Guidelines for secure authentication implementation',
        rules: [
          new Rule({
            statement: 'Use strong password policies',
            rationale: 'Prevents brute force attacks',
            implementation: 'Implement minimum length and complexity requirements'
          })
        ],
        examples: [
          new CodeExample({
            language: 'javascript',
            title: 'Password validation',
            goodExample: 'const isStrong = password.length >= 8 && /[A-Z]/.test(password);',
            explanation: 'Validates password strength'
          })
        ],
        relatedGuidelines: ['test-security-session']
      }),
      new GuidelineEntry({
        id: 'test-security-session',
        title: 'Session Management Guidelines',
        category: 'security',
        priority: 'critical',
        description: 'Guidelines for secure session handling',
        rules: [
          new Rule({
            statement: 'Use secure session tokens',
            rationale: 'Prevents session hijacking',
            implementation: 'Generate cryptographically secure random tokens'
          })
        ],
        examples: [],
        relatedGuidelines: ['test-security-auth']
      }),
      new GuidelineEntry({
        id: 'test-performance-caching',
        title: 'Caching Performance Guidelines',
        category: 'performance',
        priority: 'recommended',
        description: 'Guidelines for implementing effective caching strategies',
        rules: [
          new Rule({
            statement: 'Cache static resources',
            rationale: 'Reduces server load and improves response times',
            implementation: 'Set appropriate cache headers for static assets'
          })
        ],
        examples: [
          new CodeExample({
            language: 'javascript',
            title: 'Cache headers example',
            goodExample: 'res.setHeader("Cache-Control", "public, max-age=31536000");',
            explanation: 'Sets cache headers for static assets'
          })
        ],
        relatedGuidelines: []
      })
    ];

    // Note: We're using the real content manager which loads actual guidelines
    // So our tests need to account for the existing content
  });

  describe('search', () => {
    it('should perform basic search without text', () => {
      const query: AdvancedSearchQuery = {
        category: 'security'
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThanOrEqual(1);
      expect(results.totalCount).toBeGreaterThanOrEqual(1);
      expect(results.query).toEqual(query);
      expect(results.executionTime).toBeGreaterThan(0);
      
      // All results should be security guidelines
      results.results.forEach(result => {
        expect(result.guideline.category).toBe('security');
      });
    });

    it('should perform text search with relevance scoring', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'authentication password'
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Find any result that matches our search terms
      const matchingResult = results.results.find(r => 
        r.guideline.title.toLowerCase().includes('authentication') ||
        r.guideline.description.toLowerCase().includes('authentication') ||
        r.guideline.title.toLowerCase().includes('password') ||
        r.guideline.description.toLowerCase().includes('password')
      );
      
      expect(matchingResult).toBeDefined();
      expect(matchingResult!.relevanceScore).toBeGreaterThan(0);
      expect(matchingResult!.matchedFields.length).toBeGreaterThan(0);
    });

    it('should search in rules when includeRules is true', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'validation',
        includeRules: true
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Find a result that has rules matching our search
      const ruleMatchResult = results.results.find(r => 
        r.matchedFields.includes('rules')
      );
      
      expect(ruleMatchResult).toBeDefined();
    });

    it('should search in examples when includeExamples is true', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'javascript',
        includeExamples: true
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThan(0);
      
      // Find a result that has examples matching our search
      const exampleMatchResult = results.results.find(r => 
        r.matchedFields.includes('examples')
      );
      
      expect(exampleMatchResult).toBeDefined();
    });

    it('should sort results by relevance by default', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'security guidelines'
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThan(0);
      
      if (results.results.length > 1) {
        for (let i = 0; i < results.results.length - 1; i++) {
          expect(results.results[i].relevanceScore).toBeGreaterThanOrEqual(
            results.results[i + 1].relevanceScore
          );
        }
      }
    });

    it('should sort results by title when specified', () => {
      const query: AdvancedSearchQuery = {
        category: 'security',
        sortBy: 'title',
        sortOrder: 'asc'
      };

      const results = searchService.search(query);

      if (results.results.length > 1) {
        for (let i = 0; i < results.results.length - 1; i++) {
          expect(results.results[i].guideline.title.localeCompare(
            results.results[i + 1].guideline.title
          )).toBeLessThanOrEqual(0);
        }
      } else {
        // If we only have one result, just verify it's a security guideline
        expect(results.results[0].guideline.category).toBe('security');
      }
    });

    it('should apply pagination correctly', () => {
      const query: AdvancedSearchQuery = {
        limit: 1,
        offset: 0
      };

      const results = searchService.search(query);

      expect(results.results.length).toBe(1);
      expect(results.totalCount).toBeGreaterThan(1);
    });

    it('should handle empty search text gracefully', () => {
      const query: AdvancedSearchQuery = {
        searchText: ''
      };

      const results = searchService.search(query);

      expect(results.results.length).toBeGreaterThan(0);
      expect(results.executionTime).toBeGreaterThan(0);
    });
  });

  describe('getFilterOptions', () => {
    it('should return filter options for all guidelines', () => {
      const options = searchService.getFilterOptions();

      expect(options.categories.length).toBeGreaterThan(0);
      expect(options.priorities.length).toBeGreaterThan(0);
      expect(options.availableKeywords.length).toBeGreaterThan(0);

      const securityCategory = options.categories.find(c => c.category === 'security');
      expect(securityCategory).toBeDefined();
      expect(securityCategory!.count).toBeGreaterThanOrEqual(1);
    });

    it('should return filtered options based on current query', () => {
      const query: AdvancedSearchQuery = {
        category: 'security'
      };

      const options = searchService.getFilterOptions(query);

      const securityCategory = options.categories.find(c => c.category === 'security');
      expect(securityCategory).toBeDefined();
      expect(securityCategory!.count).toBeGreaterThan(0);
    });
  });

  describe('findSimilar', () => {
    it('should find similar guidelines based on content', () => {
      const similar = searchService.findSimilar('test-security-auth', 3);

      expect(similar.length).toBeGreaterThan(0);
      expect(similar.find(g => g.id === 'test-security-auth')).toBeUndefined(); // Should not include itself
      
      // Should prioritize guidelines in the same category
      const sessionGuideline = similar.find(g => g.id === 'test-security-session');
      expect(sessionGuideline).toBeDefined();
    });

    it('should return empty array for non-existent guideline', () => {
      const similar = searchService.findSimilar('non-existent-id');

      expect(similar).toEqual([]);
    });

    it('should respect the limit parameter', () => {
      const similar = searchService.findSimilar('test-security-auth', 1);

      expect(similar.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('should return autocomplete suggestions for partial text', () => {
      const suggestions = searchService.getAutocompleteSuggestions('auth');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('auth'))).toBe(true);
    });

    it('should return empty array for very short text', () => {
      const suggestions = searchService.getAutocompleteSuggestions('a');

      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty text', () => {
      const suggestions = searchService.getAutocompleteSuggestions('');

      expect(suggestions).toEqual([]);
    });

    it('should respect the limit parameter', () => {
      const suggestions = searchService.getAutocompleteSuggestions('security', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return sorted suggestions', () => {
      const suggestions = searchService.getAutocompleteSuggestions('sec');

      if (suggestions.length > 1) {
        for (let i = 0; i < suggestions.length - 1; i++) {
          expect(suggestions[i].localeCompare(suggestions[i + 1])).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('error handling', () => {
    it('should handle malformed search queries gracefully', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'test',
        limit: -1, // Invalid limit
        offset: -1  // Invalid offset
      };

      expect(() => searchService.search(query)).not.toThrow();
    });

    it('should handle queries with no results', () => {
      const query: AdvancedSearchQuery = {
        searchText: 'xyzabc123nonexistentterm456def'
      };

      const results = searchService.search(query);

      expect(results.results.length).toBe(0);
      expect(results.totalCount).toBe(0);
      expect(results.executionTime).toBeGreaterThan(0);
    });
  });
});