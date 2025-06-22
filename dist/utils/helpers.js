"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAgentFile = validateAgentFile;
exports.parseAgentFile = parseAgentFile;
exports.parseAgentFilename = parseAgentFilename;
exports.generateAgentFilename = generateAgentFilename;
exports.isAgentFile = isAgentFile;
exports.normalizeMetadata = normalizeMetadata;
const parser_1 = require("../parser");
/**
 * Convenience function to validate an agent file from content
 */
async function validateAgentFile(content, filePath) {
    try {
        const agentFile = parser_1.AgentParser.parse(content, filePath);
        return parser_1.AgentParser.validate(agentFile);
    }
    catch (error) {
        return {
            valid: false,
            errors: [{
                    field: 'agent',
                    message: error instanceof Error ? error.message : 'Failed to parse agent file'
                }],
            warnings: []
        };
    }
}
/**
 * Convenience function to parse an agent file from content
 */
async function parseAgentFile(content, filePath) {
    try {
        return parser_1.AgentParser.parse(content, filePath);
    }
    catch (error) {
        console.error('Failed to parse agent file:', error);
        return null;
    }
}
/**
 * Extract agent name and version from filename
 * Example: "my-agent-v1.2.0.agent" -> { name: "my-agent", version: "1.2.0" }
 */
function parseAgentFilename(filename) {
    const basename = filename.replace(/\.(agent\.md|agent|md)$/, '');
    const versionMatch = basename.match(/-v?(\d+\.\d+\.\d+)$/);
    if (versionMatch) {
        return {
            name: basename.substring(0, basename.lastIndexOf('-')),
            version: versionMatch[1]
        };
    }
    return { name: basename };
}
/**
 * Generate a filename from agent metadata
 */
function generateAgentFilename(name, version) {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (version) {
        return `${safeName}-v${version}.agent`;
    }
    return `${safeName}.agent`;
}
/**
 * Check if a file is an agent file based on extension or content
 */
function isAgentFile(filename, content) {
    // Check by filename
    if (filename.endsWith('.agent')) {
        return true;
    }
    // Check by content if provided
    if (content) {
        // Simple check for agent frontmatter
        return content.includes('agent:') && content.startsWith('---');
    }
    return false;
}
/**
 * Normalize agent metadata for consistency
 */
function normalizeMetadata(metadata) {
    const normalized = { ...metadata };
    // Normalize arrays - remove duplicates and sort
    const arrayFields = [
        'capabilities', 'coding_languages', 'frameworks',
        'tools', 'technologies', 'industries', 'skills',
        'domains', 'languages', 'tags', 'keywords', 'use_cases'
    ];
    for (const field of arrayFields) {
        if (Array.isArray(normalized[field])) {
            normalized[field] = [...new Set(normalized[field])].sort();
        }
    }
    // Normalize strings - trim whitespace
    for (const [key, value] of Object.entries(normalized)) {
        if (typeof value === 'string') {
            normalized[key] = value.trim();
        }
    }
    return normalized;
}
//# sourceMappingURL=helpers.js.map