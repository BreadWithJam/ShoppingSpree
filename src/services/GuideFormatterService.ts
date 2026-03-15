import { GuidelineEntry } from '../models/GuidelineEntry';
import { Rule, CodeExample, GuidelineCategory } from '../types';
import { SearchResults } from './GuideSearchService';

/**
 * Output format options
 */
export type OutputFormat = 'markdown' | 'html' | 'json' | 'text';

/**
 * Formatting options
 */
export interface FormattingOptions {
  format: OutputFormat;
  includeTableOfContents?: boolean;
  includeExamples?: boolean;
  includeRules?: boolean;
  includeRelatedGuidelines?: boolean;
  maxExamplesPerGuideline?: number;
  codeBlockStyle?: 'fenced' | 'indented';
  headingLevel?: number;
}

/**
 * Template configuration for different output formats
 */
export interface TemplateConfig {
  guidelineHeader: string;
  ruleHeader: string;
  exampleHeader: string;
  codeBlockStart: string;
  codeBlockEnd: string;
  listItemPrefix: string;
  sectionSeparator: string;
}

/**
 * Service for formatting and presenting guide content in various formats
 */
export class GuideFormatterService {
  private templates: Map<OutputFormat, TemplateConfig> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Format a single guideline entry
   */
  public formatGuideline(guideline: GuidelineEntry, options: FormattingOptions): string {
    const template = this.templates.get(options.format);
    if (!template) {
      throw new Error(`Unsupported format: ${options.format}`);
    }

    switch (options.format) {
      case 'markdown':
        return this.formatGuidelineAsMarkdown(guideline, options, template);
      case 'html':
        return this.formatGuidelineAsHtml(guideline, options, template);
      case 'json':
        return this.formatGuidelineAsJson(guideline, options);
      case 'text':
        return this.formatGuidelineAsText(guideline, options, template);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Format multiple guidelines
   */
  public formatGuidelines(guidelines: GuidelineEntry[], options: FormattingOptions): string {
    const formattedGuidelines = guidelines.map(guideline => 
      this.formatGuideline(guideline, options)
    );

    const template = this.templates.get(options.format);
    if (!template) {
      throw new Error(`Unsupported format: ${options.format}`);
    }

    let result = '';

    // Add table of contents if requested
    if (options.includeTableOfContents && options.format === 'markdown') {
      result += this.generateTableOfContents(guidelines, options);
      result += '\n\n';
    }

    // Join formatted guidelines
    result += formattedGuidelines.join(template.sectionSeparator);

    return result;
  }

  /**
   * Format search results with metadata
   */
  public formatSearchResults(searchResults: SearchResults, options: FormattingOptions): string {
    let result = '';

    if (options.format === 'markdown') {
      result += `# Search Results\n\n`;
      result += `**Query:** ${JSON.stringify(searchResults.query)}\n`;
      result += `**Total Results:** ${searchResults.totalCount}\n`;
      result += `**Execution Time:** ${searchResults.executionTime}ms\n\n`;
    } else if (options.format === 'html') {
      result += `<h1>Search Results</h1>\n`;
      result += `<p><strong>Query:</strong> ${JSON.stringify(searchResults.query)}</p>\n`;
      result += `<p><strong>Total Results:</strong> ${searchResults.totalCount}</p>\n`;
      result += `<p><strong>Execution Time:</strong> ${searchResults.executionTime}ms</p>\n`;
    }

    const guidelines = searchResults.results.map(result => result.guideline);
    result += this.formatGuidelines(guidelines, options);

    return result;
  }

  /**
   * Generate a complete guide document
   */
  public generateCompleteGuide(
    guidelinesByCategory: Map<GuidelineCategory, GuidelineEntry[]>,
    options: FormattingOptions
  ): string {
    let result = '';

    if (options.format === 'markdown') {
      result += '# AI Website Development Guide\n\n';
      result += 'A comprehensive reference document for building secure, clean, and well-architected websites.\n\n';
    } else if (options.format === 'html') {
      result += '<h1>AI Website Development Guide</h1>\n';
      result += '<p>A comprehensive reference document for building secure, clean, and well-architected websites.</p>\n';
    }

    // Generate table of contents for the entire guide
    if (options.includeTableOfContents) {
      result += this.generateCategoryTableOfContents(guidelinesByCategory, options);
      result += '\n\n';
    }

    // Format each category
    const categoryOrder: GuidelineCategory[] = ['security', 'code-quality', 'architecture', 'performance', 'accessibility', 'testing'];
    
    categoryOrder.forEach(category => {
      const guidelines = guidelinesByCategory.get(category);
      if (guidelines && guidelines.length > 0) {
        result += this.formatCategory(category, guidelines, options);
        result += '\n\n';
      }
    });

    return result;
  }

  /**
   * Format a category section
   */
  private formatCategory(category: GuidelineCategory, guidelines: GuidelineEntry[], options: FormattingOptions): string {
    const categoryTitle = this.getCategoryTitle(category);
    let result = '';

    if (options.format === 'markdown') {
      result += `## ${categoryTitle}\n\n`;
    } else if (options.format === 'html') {
      result += `<h2>${categoryTitle}</h2>\n`;
    }

    result += this.formatGuidelines(guidelines, {
      ...options,
      headingLevel: (options.headingLevel || 2) + 1
    });

    return result;
  }

  /**
   * Format guideline as Markdown
   */
  private formatGuidelineAsMarkdown(guideline: GuidelineEntry, options: FormattingOptions, template: TemplateConfig): string {
    const headingLevel = options.headingLevel || 3;
    const headingPrefix = '#'.repeat(headingLevel);
    
    let result = `${headingPrefix} ${guideline.title}\n\n`;
    result += `**Category:** ${guideline.category} | **Priority:** ${guideline.priority}\n\n`;
    result += `${guideline.description}\n\n`;

    // Add rules
    if (options.includeRules !== false && guideline.rules.length > 0) {
      result += `${'#'.repeat(headingLevel + 1)} Rules\n\n`;
      guideline.rules.forEach((rule, index) => {
        result += `${index + 1}. **${rule.statement}**\n`;
        result += `   - *Rationale:* ${rule.rationale}\n`;
        result += `   - *Implementation:* ${rule.implementation}\n`;
        if (rule.exceptions && rule.exceptions.length > 0) {
          result += `   - *Exceptions:* ${rule.exceptions.join(', ')}\n`;
        }
        result += '\n';
      });
    }

    // Add examples
    if (options.includeExamples !== false && guideline.examples.length > 0) {
      result += `${'#'.repeat(headingLevel + 2)} Examples\n\n`;
      const maxExamples = options.maxExamplesPerGuideline || guideline.examples.length;
      guideline.examples.slice(0, maxExamples).forEach(example => {
        result += `${'#'.repeat(headingLevel + 3)} ${example.title}\n\n`;
        result += `${example.explanation}\n\n`;
        
        if (example.goodExample) {
          result += '**Good Example:**\n';
          result += `\`\`\`${example.language}\n${example.goodExample}\n\`\`\`\n\n`;
        }
        
        if (example.badExample) {
          result += '**Bad Example:**\n';
          result += `\`\`\`${example.language}\n${example.badExample}\n\`\`\`\n\n`;
        }
      });
    }

    // Add related guidelines
    if (options.includeRelatedGuidelines !== false && guideline.relatedGuidelines.length > 0) {
      result += `${'#'.repeat(headingLevel + 1)} Related Guidelines\n\n`;
      guideline.relatedGuidelines.forEach(relatedId => {
        result += `- ${relatedId}\n`;
      });
      result += '\n';
    }

    return result;
  }

  /**
   * Format guideline as HTML
   */
  private formatGuidelineAsHtml(guideline: GuidelineEntry, options: FormattingOptions, template: TemplateConfig): string {
    const headingLevel = Math.min(options.headingLevel || 3, 6);
    
    let result = `<h${headingLevel}>${this.escapeHtml(guideline.title)}</h${headingLevel}>\n`;
    result += `<p><strong>Category:</strong> ${guideline.category} | <strong>Priority:</strong> ${guideline.priority}</p>\n`;
    result += `<p>${this.escapeHtml(guideline.description)}</p>\n`;

    // Add rules
    if (options.includeRules !== false && guideline.rules.length > 0) {
      result += `<h${headingLevel + 1}>Rules</h${headingLevel + 1}>\n<ol>\n`;
      guideline.rules.forEach(rule => {
        result += `<li>\n`;
        result += `  <strong>${this.escapeHtml(rule.statement)}</strong>\n`;
        result += `  <ul>\n`;
        result += `    <li><em>Rationale:</em> ${this.escapeHtml(rule.rationale)}</li>\n`;
        result += `    <li><em>Implementation:</em> ${this.escapeHtml(rule.implementation)}</li>\n`;
        if (rule.exceptions && rule.exceptions.length > 0) {
          result += `    <li><em>Exceptions:</em> ${rule.exceptions.map(e => this.escapeHtml(e)).join(', ')}</li>\n`;
        }
        result += `  </ul>\n`;
        result += `</li>\n`;
      });
      result += `</ol>\n`;
    }

    // Add examples
    if (options.includeExamples !== false && guideline.examples.length > 0) {
      result += `<h${headingLevel + 1}>Examples</h${headingLevel + 1}>\n`;
      const maxExamples = options.maxExamplesPerGuideline || guideline.examples.length;
      guideline.examples.slice(0, maxExamples).forEach(example => {
        result += `<h${headingLevel + 2}>${this.escapeHtml(example.title)}</h${headingLevel + 2}>\n`;
        result += `<p>${this.escapeHtml(example.explanation)}</p>\n`;
        
        if (example.goodExample) {
          result += '<p><strong>Good Example:</strong></p>\n';
          result += `<pre><code class="language-${example.language}">${this.escapeHtml(example.goodExample)}</code></pre>\n`;
        }
        
        if (example.badExample) {
          result += '<p><strong>Bad Example:</strong></p>\n';
          result += `<pre><code class="language-${example.language}">${this.escapeHtml(example.badExample)}</code></pre>\n`;
        }
      });
    }

    // Add related guidelines
    if (options.includeRelatedGuidelines !== false && guideline.relatedGuidelines.length > 0) {
      result += `<h${headingLevel + 1}>Related Guidelines</h${headingLevel + 1}>\n<ul>\n`;
      guideline.relatedGuidelines.forEach(relatedId => {
        result += `<li>${this.escapeHtml(relatedId)}</li>\n`;
      });
      result += `</ul>\n`;
    }

    return result;
  }

  /**
   * Format guideline as JSON
   */
  private formatGuidelineAsJson(guideline: GuidelineEntry, options: FormattingOptions): string {
    const data: any = {
      id: guideline.id,
      title: guideline.title,
      category: guideline.category,
      priority: guideline.priority,
      description: guideline.description
    };

    if (options.includeRules !== false) {
      data.rules = guideline.rules;
    }

    if (options.includeExamples !== false) {
      const maxExamples = options.maxExamplesPerGuideline || guideline.examples.length;
      data.examples = guideline.examples.slice(0, maxExamples);
    }

    if (options.includeRelatedGuidelines !== false) {
      data.relatedGuidelines = guideline.relatedGuidelines;
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Format guideline as plain text
   */
  private formatGuidelineAsText(guideline: GuidelineEntry, options: FormattingOptions, template: TemplateConfig): string {
    let result = `${guideline.title.toUpperCase()}\n`;
    result += '='.repeat(guideline.title.length) + '\n\n';
    result += `Category: ${guideline.category} | Priority: ${guideline.priority}\n\n`;
    result += `${guideline.description}\n\n`;

    // Add rules
    if (options.includeRules !== false && guideline.rules.length > 0) {
      result += 'RULES:\n';
      result += '------\n';
      guideline.rules.forEach((rule, index) => {
        result += `${index + 1}. ${rule.statement}\n`;
        result += `   Rationale: ${rule.rationale}\n`;
        result += `   Implementation: ${rule.implementation}\n`;
        if (rule.exceptions && rule.exceptions.length > 0) {
          result += `   Exceptions: ${rule.exceptions.join(', ')}\n`;
        }
        result += '\n';
      });
    }

    // Add examples
    if (options.includeExamples !== false && guideline.examples.length > 0) {
      result += 'EXAMPLES:\n';
      result += '---------\n';
      const maxExamples = options.maxExamplesPerGuideline || guideline.examples.length;
      guideline.examples.slice(0, maxExamples).forEach(example => {
        result += `${example.title}:\n`;
        result += `${example.explanation}\n\n`;
        
        if (example.goodExample) {
          result += 'Good Example:\n';
          result += example.goodExample + '\n\n';
        }
        
        if (example.badExample) {
          result += 'Bad Example:\n';
          result += example.badExample + '\n\n';
        }
      });
    }

    return result;
  }

  /**
   * Generate table of contents for guidelines
   */
  private generateTableOfContents(guidelines: GuidelineEntry[], options: FormattingOptions): string {
    if (options.format === 'markdown') {
      let toc = '## Table of Contents\n\n';
      guidelines.forEach(guideline => {
        const anchor = guideline.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        toc += `- [${guideline.title}](#${anchor})\n`;
      });
      return toc;
    } else if (options.format === 'html') {
      let toc = '<h2>Table of Contents</h2>\n<ul>\n';
      guidelines.forEach(guideline => {
        const anchor = guideline.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        toc += `<li><a href="#${anchor}">${this.escapeHtml(guideline.title)}</a></li>\n`;
      });
      toc += '</ul>\n';
      return toc;
    }
    return '';
  }

  /**
   * Generate table of contents for categories
   */
  private generateCategoryTableOfContents(
    guidelinesByCategory: Map<GuidelineCategory, GuidelineEntry[]>,
    options: FormattingOptions
  ): string {
    if (options.format === 'markdown') {
      let toc = '## Table of Contents\n\n';
      guidelinesByCategory.forEach((guidelines, category) => {
        const categoryTitle = this.getCategoryTitle(category);
        const anchor = categoryTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        toc += `- [${categoryTitle}](#${anchor})\n`;
        guidelines.forEach(guideline => {
          const guidelineAnchor = guideline.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          toc += `  - [${guideline.title}](#${guidelineAnchor})\n`;
        });
      });
      return toc;
    }
    return '';
  }

  /**
   * Get human-readable category title
   */
  private getCategoryTitle(category: GuidelineCategory): string {
    const titles: Record<GuidelineCategory, string> = {
      'security': 'Security Guidelines',
      'code-quality': 'Code Quality Standards',
      'architecture': 'Architecture Patterns',
      'performance': 'Performance Optimization',
      'accessibility': 'Accessibility Compliance',
      'testing': 'Testing & Validation'
    };
    return titles[category];
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }

  /**
   * Initialize format templates
   */
  private initializeTemplates(): void {
    this.templates.set('markdown', {
      guidelineHeader: '###',
      ruleHeader: '####',
      exampleHeader: '#####',
      codeBlockStart: '```',
      codeBlockEnd: '```',
      listItemPrefix: '- ',
      sectionSeparator: '\n\n---\n\n'
    });

    this.templates.set('html', {
      guidelineHeader: '<h3>',
      ruleHeader: '<h4>',
      exampleHeader: '<h5>',
      codeBlockStart: '<pre><code>',
      codeBlockEnd: '</code></pre>',
      listItemPrefix: '<li>',
      sectionSeparator: '\n<hr>\n'
    });

    this.templates.set('text', {
      guidelineHeader: '',
      ruleHeader: '',
      exampleHeader: '',
      codeBlockStart: '',
      codeBlockEnd: '',
      listItemPrefix: '- ',
      sectionSeparator: '\n\n' + '='.repeat(50) + '\n\n'
    });

    this.templates.set('json', {
      guidelineHeader: '',
      ruleHeader: '',
      exampleHeader: '',
      codeBlockStart: '',
      codeBlockEnd: '',
      listItemPrefix: '',
      sectionSeparator: ',\n'
    });
  }
}