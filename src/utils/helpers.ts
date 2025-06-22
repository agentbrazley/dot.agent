import { AgentParser } from '../parser';
import type { AgentFile, ValidationResult } from '../types/agent';

/**
 * Convenience function to validate an agent file from content
 */
export async function validateAgentFile(
  content: string,
  filePath?: string
): Promise<ValidationResult> {
  try {
    const agentFile = AgentParser.parse(content, filePath);
    return AgentParser.validate(agentFile);
  } catch (error) {
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
export async function parseAgentFile(
  content: string,
  filePath?: string
): Promise<AgentFile | null> {
  try {
    return AgentParser.parse(content, filePath);
  } catch (error) {
    console.error('Failed to parse agent file:', error);
    return null;
  }
}

/**
 * Extract agent name and version from filename
 * Example: "my-agent-v1.2.0.agent" -> { name: "my-agent", version: "1.2.0" }
 */
export function parseAgentFilename(filename: string): {
  name?: string;
  version?: string;
} {
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
export function generateAgentFilename(name: string, version?: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (version) {
    return `${safeName}-v${version}.agent`;
  }
  return `${safeName}.agent`;
}

/**
 * Check if a file is an agent file based on extension or content
 */
export function isAgentFile(filename: string, content?: string): boolean {
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
export function normalizeMetadata(metadata: any): any {
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