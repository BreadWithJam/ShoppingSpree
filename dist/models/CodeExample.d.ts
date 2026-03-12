import { CodeExample as ICodeExample, CodeLanguage } from '../types';
/**
 * CodeExample class with validation
 */
export declare class CodeExample implements ICodeExample {
    readonly language: CodeLanguage;
    readonly title: string;
    readonly goodExample: string;
    readonly badExample?: string;
    readonly explanation: string;
    constructor(data: ICodeExample);
    private validateInput;
    /**
     * Check if this example has a bad example for comparison
     */
    hasBadExample(): boolean;
    /**
     * Check if this example is for a specific language
     */
    isLanguage(language: CodeLanguage): boolean;
}
//# sourceMappingURL=CodeExample.d.ts.map