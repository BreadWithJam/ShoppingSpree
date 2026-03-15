import { GuideFormatterService, FormattingOptions } from '../GuideFormatterService';
import { GuideSearchService, SearchResults } from '../GuideSearchService';
import { GuideContentManager } from '../GuideContentManager';
import { GuidelineEntry } from '../../models/GuidelineEntry';
import { Rule } from '../../models/Rule';
import { CodeExample } from '../../models/CodeExample';
import { GuidelineCategory } from '../../types';

describe('GuideFormatterService', () => {
  let formatterService: GuideFormatterService;
  let testGuideline: GuidelineEntry;
  let testGuidelines: GuidelineEntry[];

  beforeEach(() => {
    formatterService = new GuideFormatterService();

    testGuideline = new GuidelineEntry({
      id: 'test-security-auth',
      title: 'Authentication Security Guidelines',
      category: 'security',
      priority: 'critical',
      description: 'Guidelines for secure authentication implementation',
      rules: [
        new Rule({
          statement: 'Use strong password policies',
          rationale: 'Prevents brute force attacks',
          implementation: 'Implement minimum length and complexity requirements',
          exceptions: ['Legacy systems with migration plans']
        })
      ],
      examples: [
        new CodeExample({
          language: 'javascript',
          title: 'Password validation',
          goodExample: 'const isStrong = password.length >= 8 && /[A-Z]/.test(password);',
          badExample: 'const isStrong = password.length > 0;',
          explanation: 'Validates password strength with proper criteria'
        })
      ],
      relatedGuidelines: ['test-security-session']
    });

    testGuidelines = [
      testGuideline,
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
        examples: [],
        relatedGuidelines: []
      })
    ];
  });

  describe('formatGuideline', () => {
    describe('markdown format', () => {
      it('should format guideline as markdown with all sections', () => {
        const options: FormattingOptions = {
          format: 'markdown',
          includeRules: true,
          includeExamples: true,
          includeRelatedGuidelines: true
        };

        const result = formatterService.formatGuideline(testGuideline, options);

        expect(result).toContain('### Authentication Security Guidelines');
        expect(result).toContain('**Category:** security | **Priority:** critical');
        expect(result).toContain('Guidelines for secure authentication implementation');
        expect(result).toContain('#### Rules');
        expect(result).toContain('Use strong password policies');
        expect(result).toContain('*Rationale:* Prevents brute force attacks');
        expect(result).toContain('*Exceptions:* Legacy systems with migration plans');
        expect(result).toContain('##### Examples');
        expect(result).toContain('##### Password validation');
        expect(result).toContain('```javascript');
        expect(result).toContain('**Good Example:**');
        expect(result).toContain('**Bad Example:**');
        expect(result).toContain('#### Related Guidelines');
        expect(result).toContain('test-security-session');
      });

      it('should exclude sections when options specify', () => {
        const options: FormattingOptions = {
          format: 'markdown',
          includeRules: false,
          includeExamples: false,
          includeRelatedGuidelines: false
        };

        const result = formatterService.formatGuideline(testGuideline, options);

        expect(result).toContain('### Authentication Security Guidelines');
        expect(result).not.toContain('#### Rules');
        expect(result).not.toContain('##### Examples');
        expect(result).not.toContain('#### Related Guidelines');
      });

      it('should respect maxExamplesPerGuideline option', () => {
        const guidelineWithMultipleExamples = new GuidelineEntry({
          ...testGuideline,
          examples: [
            new CodeExample({
              language: 'javascript',
              title: 'Example 1',
              goodExample: 'code1',
              explanation: 'explanation1'
            }),
            new CodeExample({
              language: 'javascript',
              title: 'Example 2',
              goodExample: 'code2',
              explanation: 'explanation2'
            })
          ]
        });

        const options: FormattingOptions = {
          format: 'markdown',
          maxExamplesPerGuideline: 1
        };

        const result = formatterService.formatGuideline(guidelineWithMultipleExamples, options);

        expect(result).toContain('Example 1');
        expect(result).not.toContain('Example 2');
      });
    });

    describe('html format', () => {
      it('should format guideline as HTML with proper escaping', () => {
        const options: FormattingOptions = {
          format: 'html',
          includeRules: true,
          includeExamples: true
        };

        const result = formatterService.formatGuideline(testGuideline, options);

        expect(result).toContain('<h3>Authentication Security Guidelines</h3>');
        expect(result).toContain('<strong>Category:</strong> security');
        expect(result).toContain('<h4>Rules</h4>');
        expect(result).toContain('<ol>');
        expect(result).toContain('<li>');
        expect(result).toContain('<em>Rationale:</em>');
        expect(result).toContain('<pre><code class="language-javascript">');
        expect(result).toContain('&amp;&amp;'); // HTML escaped &&
      });

      it('should handle special characters in HTML', () => {
        const guidelineWithSpecialChars = new GuidelineEntry({
          ...testGuideline,
          title: 'Test & Special <Characters>',
          description: 'Description with "quotes" and \'apostrophes\''
        });

        const options: FormattingOptions = {
          format: 'html'
        };

        const result = formatterService.formatGuideline(guidelineWithSpecialChars, options);

        expect(result).toContain('Test &amp; Special &lt;Characters&gt;');
        expect(result).toContain('&quot;quotes&quot;');
        expect(result).toContain('&#39;apostrophes&#39;');
      });
    });

    describe('json format', () => {
      it('should format guideline as JSON', () => {
        const options: FormattingOptions = {
          format: 'json',
          includeRules: true,
          includeExamples: true,
          includeRelatedGuidelines: true
        };

        const result = formatterService.formatGuideline(testGuideline, options);
        const parsed = JSON.parse(result);

        expect(parsed.id).toBe('test-security-auth');
        expect(parsed.title).toBe('Authentication Security Guidelines');
        expect(parsed.category).toBe('security');
        expect(parsed.priority).toBe('critical');
        expect(parsed.rules).toHaveLength(1);
        expect(parsed.examples).toHaveLength(1);
        expect(parsed.relatedGuidelines).toEqual(['test-security-session']);
      });

      it('should exclude sections in JSON when options specify', () => {
        const options: FormattingOptions = {
          format: 'json',
          includeRules: false,
          includeExamples: false,
          includeRelatedGuidelines: false
        };

        const result = formatterService.formatGuideline(testGuideline, options);
        const parsed = JSON.parse(result);

        expect(parsed.rules).toBeUndefined();
        expect(parsed.examples).toBeUndefined();
        expect(parsed.relatedGuidelines).toBeUndefined();
      });
    });

    describe('text format', () => {
      it('should format guideline as plain text', () => {
        const options: FormattingOptions = {
          format: 'text',
          includeRules: true,
          includeExamples: true
        };

        const result = formatterService.formatGuideline(testGuideline, options);

        expect(result).toContain('AUTHENTICATION SECURITY GUIDELINES');
        expect(result).toContain('='.repeat('Authentication Security Guidelines'.length));
        expect(result).toContain('Category: security | Priority: critical');
        expect(result).toContain('RULES:');
        expect(result).toContain('------');
        expect(result).toContain('1. Use strong password policies');
        expect(result).toContain('EXAMPLES:');
        expect(result).toContain('---------');
      });
    });

    it('should throw error for unsupported format', () => {
      const options: FormattingOptions = {
        format: 'xml' as any // Invalid format
      };

      expect(() => formatterService.formatGuideline(testGuideline, options))
        .toThrow('Unsupported format: xml');
    });
  });

  describe('formatGuidelines', () => {
    it('should format multiple guidelines with separators', () => {
      const options: FormattingOptions = {
        format: 'markdown'
      };

      const result = formatterService.formatGuidelines(testGuidelines, options);

      expect(result).toContain('### Authentication Security Guidelines');
      expect(result).toContain('### Caching Performance Guidelines');
      expect(result).toContain('---'); // Section separator
    });

    it('should include table of contents when requested', () => {
      const options: FormattingOptions = {
        format: 'markdown',
        includeTableOfContents: true
      };

      const result = formatterService.formatGuidelines(testGuidelines, options);

      expect(result).toContain('## Table of Contents');
      expect(result).toContain('[Authentication Security Guidelines]');
      expect(result).toContain('[Caching Performance Guidelines]');
    });
  });

  describe('formatSearchResults', () => {
    it('should format search results with metadata', () => {
      const searchResults: SearchResults = {
        results: testGuidelines.map(g => ({
          guideline: g,
          relevanceScore: 0.8,
          matchedFields: ['title']
        })),
        totalCount: 2,
        query: { searchText: 'test' },
        executionTime: 15
      };

      const options: FormattingOptions = {
        format: 'markdown'
      };

      const result = formatterService.formatSearchResults(searchResults, options);

      expect(result).toContain('# Search Results');
      expect(result).toContain('**Total Results:** 2');
      expect(result).toContain('**Execution Time:** 15ms');
      expect(result).toContain('### Authentication Security Guidelines');
    });
  });

  describe('generateCompleteGuide', () => {
    it('should generate complete guide with categories', () => {
      const guidelinesByCategory = new Map<GuidelineCategory, GuidelineEntry[]>();
      guidelinesByCategory.set('security', [testGuidelines[0]]);
      guidelinesByCategory.set('performance', [testGuidelines[1]]);

      const options: FormattingOptions = {
        format: 'markdown',
        includeTableOfContents: true
      };

      const result = formatterService.generateCompleteGuide(guidelinesByCategory, options);

      expect(result).toContain('# AI Website Development Guide');
      expect(result).toContain('## Table of Contents');
      expect(result).toContain('## Security Guidelines');
      expect(result).toContain('## Performance Optimization');
      expect(result).toContain('### Authentication Security Guidelines');
      expect(result).toContain('### Caching Performance Guidelines');
    });
  });

  describe('error handling', () => {
    it('should handle guidelines with no rules or examples', () => {
      const emptyGuideline = new GuidelineEntry({
        id: 'empty-guideline',
        title: 'Empty Guideline',
        category: 'testing',
        priority: 'optional',
        description: 'A guideline with no rules or examples',
        rules: [],
        examples: [],
        relatedGuidelines: []
      });

      const options: FormattingOptions = {
        format: 'markdown'
      };

      expect(() => formatterService.formatGuideline(emptyGuideline, options))
        .not.toThrow();

      const result = formatterService.formatGuideline(emptyGuideline, options);
      expect(result).toContain('### Empty Guideline');
      expect(result).toContain('A guideline with no rules or examples');
    });

    it('should handle empty guidelines array', () => {
      const options: FormattingOptions = {
        format: 'markdown'
      };

      const result = formatterService.formatGuidelines([], options);
      expect(result).toBe('');
    });
  });
});