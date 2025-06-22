import type { AgentFile, ValidationResult } from '../types/agent';
export declare class AgentParser {
    /**
     * Parse agent file content and extract frontmatter
     */
    static parse(content: string, filePath?: string): AgentFile;
    /**
     * Validate agent metadata against schema
     */
    static validate(agentFile: AgentFile): ValidationResult;
    /**
     * Parse and validate in one step
     */
    static parseAndValidate(content: string, filePath?: string): {
        agentFile: AgentFile;
        validation: ValidationResult;
    };
    /**
     * Serialize agent metadata back to YAML frontmatter
     */
    static serialize(agentFile: AgentFile): string;
}
//# sourceMappingURL=index.d.ts.map