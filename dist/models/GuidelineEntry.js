"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidelineEntry = void 0;
/**
 * GuidelineEntry class with validation
 */
class GuidelineEntry {
    constructor(data) {
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
    validateInput(data) {
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
    hasRules() {
        return this.rules.length > 0;
    }
    /**
     * Check if this guideline has any examples
     */
    hasExamples() {
        return this.examples.length > 0;
    }
    /**
     * Get rules by validation method
     */
    getRulesByValidation(method) {
        return this.rules.filter(rule => rule.validation?.method === method);
    }
}
exports.GuidelineEntry = GuidelineEntry;
//# sourceMappingURL=GuidelineEntry.js.map