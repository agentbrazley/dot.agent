import { z } from 'zod';

// Helper schemas
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const SemverSchema = z.string().regex(semverRegex, {
  message: 'Version must be valid semantic versioning (e.g., 1.0.0, 2.1.0-beta)'
});

const ISO8601Schema = z.string().datetime({
  message: 'Date must be in ISO 8601 format'
});

// Model requirements schema
const ModelRequirementsSchema = z.object({
  min_context: z.number().int().positive().optional(),
  max_tokens: z.number().int().positive().optional(),
  preferred_models: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(2).optional()
}).strict();

// Parameters schema
const ParametersSchema = z.object({
  max_iterations: z.number().int().positive().optional(),
  confidence_threshold: z.number().min(0).max(1).optional()
}).catchall(z.any());

// Main agent metadata schema
export const AgentMetadataSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Agent name is required'),
  
  // Strongly recommended
  version: SemverSchema.optional(),
  
  // Core Identity
  description: z.string().optional(),
  role: z.string().optional(),
  specialization: z.string().optional(),
  
  // Technical Capabilities
  capabilities: z.array(z.string()).optional(),
  coding_languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  
  // Domain Expertise
  industries: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  domains: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  
  // Model & Configuration
  model_requirements: ModelRequirementsSchema.optional(),
  parameters: ParametersSchema.optional(),
  
  // Authorship & Governance
  author: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().email().optional(),
  license: z.string().optional(),
  created: ISO8601Schema.optional(),
  updated: ISO8601Schema.optional(),
  maintainers: z.array(z.string()).optional(),
  
  // Discovery & Classification
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  use_cases: z.array(z.string()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  
  // Dependencies & Integration
  dependencies: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  apis: z.array(z.string()).optional(),
  requires_internet: z.boolean().optional()
});

// Wrapper schema for the full agent frontmatter
export const AgentFrontmatterSchema = z.object({
  agent: AgentMetadataSchema
});

// Type exports
export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;
export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;