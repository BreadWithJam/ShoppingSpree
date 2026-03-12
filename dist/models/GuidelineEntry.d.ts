import { GuidelineEntry as IGuidelineEntry, GuidelineCategory, Priority, Rule, CodeExample } from '../types';
/**
 * GuidelineEntry class with validation
 */
export declare class GuidelineEntry implements IGuidelineEntry {
    readonly id: string;
    readonly title: string;
    readonly category: GuidelineCategory;
    readonly priority: Priority;
    readonly description: string;
    readonly rules: Rule[];
    readonly examples: CodeExample[];
    readonly relatedGuidelines: string[];
    constructor(data: IGuidelineEntry);
    private validateInput;
    /**
     * Check if this guideline has any rules
     */
    hasRules(): boolean;
    /**
     * Check if this guideline has any examples
     */
    hasExamples(): boolean;
    /**
     * Get rules by validation method
     */
    getRulesByValidation(method: string): Rule[];
}
//# sourceMappingURL=GuidelineEntry.d.ts.map