import { Rule as IRule, ValidationCriteria } from '../types';
/**
 * Rule class with validation
 */
export declare class Rule implements IRule {
    readonly statement: string;
    readonly rationale: string;
    readonly implementation: string;
    readonly exceptions?: string[];
    readonly validation?: ValidationCriteria;
    constructor(data: IRule);
    private validateInput;
    /**
     * Check if this rule has exceptions
     */
    hasExceptions(): boolean;
    /**
     * Check if this rule has validation criteria
     */
    hasValidation(): boolean;
    /**
     * Check if validation is automated
     */
    isAutomatedValidation(): boolean;
}
//# sourceMappingURL=Rule.d.ts.map