"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
/**
 * Rule class with validation
 */
class Rule {
    constructor(data) {
        this.validateInput(data);
        this.statement = data.statement;
        this.rationale = data.rationale;
        this.implementation = data.implementation;
        this.exceptions = data.exceptions ? [...data.exceptions] : undefined;
        this.validation = data.validation ? { ...data.validation } : undefined;
    }
    validateInput(data) {
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
    hasExceptions() {
        return Boolean(this.exceptions && this.exceptions.length > 0);
    }
    /**
     * Check if this rule has validation criteria
     */
    hasValidation() {
        return Boolean(this.validation);
    }
    /**
     * Check if validation is automated
     */
    isAutomatedValidation() {
        return Boolean(this.validation?.automated);
    }
}
exports.Rule = Rule;
//# sourceMappingURL=Rule.js.map