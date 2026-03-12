"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExample = void 0;
/**
 * CodeExample class with validation
 */
class CodeExample {
    constructor(data) {
        this.validateInput(data);
        this.language = data.language;
        this.title = data.title;
        this.goodExample = data.goodExample;
        this.badExample = data.badExample;
        this.explanation = data.explanation;
    }
    validateInput(data) {
        if (!data.language) {
            throw new Error('CodeExample language is required');
        }
        if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
            throw new Error('CodeExample title is required and must be a non-empty string');
        }
        if (!data.goodExample || typeof data.goodExample !== 'string' || data.goodExample.trim().length === 0) {
            throw new Error('CodeExample goodExample is required and must be a non-empty string');
        }
        if (!data.explanation || typeof data.explanation !== 'string' || data.explanation.trim().length === 0) {
            throw new Error('CodeExample explanation is required and must be a non-empty string');
        }
        if (data.badExample !== undefined && (typeof data.badExample !== 'string' || data.badExample.trim().length === 0)) {
            throw new Error('CodeExample badExample must be a non-empty string if provided');
        }
    }
    /**
     * Check if this example has a bad example for comparison
     */
    hasBadExample() {
        return Boolean(this.badExample);
    }
    /**
     * Check if this example is for a specific language
     */
    isLanguage(language) {
        return this.language === language;
    }
}
exports.CodeExample = CodeExample;
//# sourceMappingURL=CodeExample.js.map