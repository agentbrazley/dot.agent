"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentFrontmatterSchema = exports.AgentMetadataSchema = void 0;
const zod_1 = require("zod");
// Helper schemas
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const SemverSchema = zod_1.z.string().regex(semverRegex, {
    message: 'Version must be valid semantic versioning (e.g., 1.0.0, 2.1.0-beta)'
});
const ISO8601Schema = zod_1.z.string().datetime({
    message: 'Date must be in ISO 8601 format'
});
// Model requirements schema
const ModelRequirementsSchema = zod_1.z.object({
    min_context: zod_1.z.number().int().positive().optional(),
    max_tokens: zod_1.z.number().int().positive().optional(),
    preferred_models: zod_1.z.array(zod_1.z.string()).optional(),
    temperature: zod_1.z.number().min(0).max(2).optional()
}).strict();
// Parameters schema
const ParametersSchema = zod_1.z.object({
    max_iterations: zod_1.z.number().int().positive().optional(),
    confidence_threshold: zod_1.z.number().min(0).max(1).optional()
}).catchall(zod_1.z.any());
// Main agent metadata schema
exports.AgentMetadataSchema = zod_1.z.object({
    // Required fields
    name: zod_1.z.string().min(1, 'Agent name is required'),
    // Strongly recommended
    version: SemverSchema.optional(),
    // Core Identity
    description: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    // Technical Capabilities
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    coding_languages: zod_1.z.array(zod_1.z.string()).optional(),
    frameworks: zod_1.z.array(zod_1.z.string()).optional(),
    tools: zod_1.z.array(zod_1.z.string()).optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional(),
    // Domain Expertise
    industries: zod_1.z.array(zod_1.z.string()).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    domains: zod_1.z.array(zod_1.z.string()).optional(),
    languages: zod_1.z.array(zod_1.z.string()).optional(),
    // Model & Configuration
    model_requirements: ModelRequirementsSchema.optional(),
    parameters: ParametersSchema.optional(),
    // Authorship & Governance
    author: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    license: zod_1.z.string().optional(),
    created: ISO8601Schema.optional(),
    updated: ISO8601Schema.optional(),
    maintainers: zod_1.z.array(zod_1.z.string()).optional(),
    // Discovery & Classification
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    category: zod_1.z.string().optional(),
    subcategory: zod_1.z.string().optional(),
    use_cases: zod_1.z.array(zod_1.z.string()).optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    // Dependencies & Integration
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    integrations: zod_1.z.array(zod_1.z.string()).optional(),
    apis: zod_1.z.array(zod_1.z.string()).optional(),
    requires_internet: zod_1.z.boolean().optional()
});
// Wrapper schema for the full agent frontmatter
exports.AgentFrontmatterSchema = zod_1.z.object({
    agent: exports.AgentMetadataSchema
});
//# sourceMappingURL=schema.js.map