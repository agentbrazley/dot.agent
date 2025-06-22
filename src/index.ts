// Core exports
export { AgentParser } from './parser';
export { AgentSearchEngine } from './search';
export { VersionManager } from './utils/version';

// Schema exports
export { 
  AgentMetadataSchema, 
  AgentFrontmatterSchema,
  type AgentMetadata as AgentMetadataSchemaType,
  type AgentFrontmatter as AgentFrontmatterSchemaType
} from './validator/schema';

// Type exports
export type {
  AgentMetadata,
  AgentFile,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './types/agent';

// Search types
export type {
  SearchOptions,
  SearchFilters,
  SortOption,
  SearchResult
} from './search';

// Version types
export type {
  VersionCompatibility,
  VersionUpdate
} from './utils/version';

// Utility functions
export { validateAgentFile, parseAgentFile } from './utils/helpers';

// Re-export commonly used functions
import { AgentParser } from './parser';
import { VersionManager } from './utils/version';

export const parse = AgentParser.parse;
export const validate = AgentParser.validate;
export const parseAndValidate = AgentParser.parseAndValidate;
export const serialize = AgentParser.serialize;

export const checkVersionCompatibility = VersionManager.checkCompatibility;
export const checkModelCompatibility = VersionManager.checkModelCompatibility;