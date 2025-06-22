"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentParser = void 0;
const gray_matter_1 = __importDefault(require("gray-matter"));
const schema_1 = require("../validator/schema");
class AgentParser {
    /**
     * Parse agent file content and extract frontmatter
     */
    static parse(content, filePath) {
        const parsed = (0, gray_matter_1.default)(content, {
            excerpt: false,
            engines: {
                yaml: (s) => require('js-yaml').load(s, { schema: require('js-yaml').FAILSAFE_SCHEMA })
            }
        });
        // Extract the agent metadata from frontmatter
        const frontmatter = parsed.data;
        if (!frontmatter.agent) {
            throw new Error('Missing required "agent" field in frontmatter');
        }
        return {
            metadata: frontmatter.agent,
            content: parsed.content.trim(),
            rawContent: content,
            filePath
        };
    }
    /**
     * Validate agent metadata against schema
     */
    static validate(agentFile) {
        const errors = [];
        const warnings = [];
        try {
            // Validate against schema
            const result = schema_1.AgentFrontmatterSchema.safeParse({ agent: agentFile.metadata });
            if (!result.success) {
                // Convert Zod errors to our format
                result.error.errors.forEach(err => {
                    const fieldPath = err.path.slice(1).join('.'); // Remove 'agent' prefix
                    errors.push({
                        field: fieldPath,
                        message: err.message,
                        value: undefined // Zod errors don't consistently provide input values
                    });
                });
            }
            // Add warnings for recommended fields
            if (!agentFile.metadata.version) {
                warnings.push({
                    field: 'version',
                    message: 'Version field is strongly recommended for collaboration',
                    suggestion: 'Add version: "1.0.0" to track changes'
                });
            }
            if (!agentFile.metadata.description) {
                warnings.push({
                    field: 'description',
                    message: 'Description helps users understand the agent purpose',
                    suggestion: 'Add a brief description of what this agent does'
                });
            }
            if (!agentFile.metadata.author && !agentFile.metadata.organization) {
                warnings.push({
                    field: 'author',
                    message: 'Author or organization helps with attribution',
                    suggestion: 'Add author name or organization'
                });
            }
            // Check for potential improvements
            if (agentFile.metadata.capabilities && agentFile.metadata.capabilities.length === 0) {
                warnings.push({
                    field: 'capabilities',
                    message: 'Empty capabilities array provides no value',
                    suggestion: 'Add specific capabilities or remove the field'
                });
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            errors.push({
                field: 'agent',
                message: error instanceof Error ? error.message : 'Unknown validation error'
            });
            return {
                valid: false,
                errors,
                warnings
            };
        }
    }
    /**
     * Parse and validate in one step
     */
    static parseAndValidate(content, filePath) {
        const agentFile = this.parse(content, filePath);
        const validation = this.validate(agentFile);
        return { agentFile, validation };
    }
    /**
     * Serialize agent metadata back to YAML frontmatter
     */
    static serialize(agentFile) {
        const frontmatter = {
            agent: agentFile.metadata
        };
        return gray_matter_1.default.stringify(agentFile.content, frontmatter);
    }
}
exports.AgentParser = AgentParser;
//# sourceMappingURL=index.js.map