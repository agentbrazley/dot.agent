import type { AgentFile, ValidationResult } from '../types/agent';
/**
 * Convenience function to validate an agent file from content
 */
export declare function validateAgentFile(content: string, filePath?: string): Promise<ValidationResult>;
/**
 * Convenience function to parse an agent file from content
 */
export declare function parseAgentFile(content: string, filePath?: string): Promise<AgentFile | null>;
/**
 * Extract agent name and version from filename
 * Example: "my-agent-v1.2.0.agent" -> { name: "my-agent", version: "1.2.0" }
 */
export declare function parseAgentFilename(filename: string): {
    name?: string;
    version?: string;
};
/**
 * Generate a filename from agent metadata
 */
export declare function generateAgentFilename(name: string, version?: string): string;
/**
 * Check if a file is an agent file based on extension or content
 */
export declare function isAgentFile(filename: string, content?: string): boolean;
/**
 * Normalize agent metadata for consistency
 */
export declare function normalizeMetadata(metadata: any): any;
//# sourceMappingURL=helpers.d.ts.map