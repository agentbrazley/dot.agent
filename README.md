# Agent Frontmatter System

A comprehensive TypeScript library and CLI tool for parsing, validating, and discovering AI agent files with standardized YAML frontmatter metadata.

## Features

- 📝 **YAML Frontmatter Parsing** - Extract and parse agent metadata from markdown files
- ✅ **Schema Validation** - Validate agent files against a comprehensive schema with helpful error messages
- 🔍 **Agent Discovery** - Search and filter agents by capabilities, languages, frameworks, and more
- 📦 **Version Management** - Semantic versioning support with compatibility checking
- 🛠️ **CLI Tools** - Command-line interface for validation, linting, and information display
- 🚀 **TypeScript Support** - Full TypeScript types and interfaces
- 🍎 **macOS File Type Registration** - Native .agent file type support with Quick Look preview

## Installation

```bash
npm install agent-frontmatter
# or
yarn add agent-frontmatter
```

For CLI usage:
```bash
npm install -g agent-frontmatter
```

### macOS File Type Registration

To register `.agent` files as a recognized file type on macOS with Quick Look preview support:

```bash
# Navigate to the project directory
cd path/to/dot.agent

# Run the registration script
./macos-registration/create-agent-app.sh

# Double-click the created AgentFileType.app to register the file type
open AgentFileType.app
```

This will:
- Register `.agent` as a recognized file type on macOS
- Enable Quick Look preview (press Space on .agent files in Finder)
- Associate the file type with the identifier `com.nikbrazley.agent`

To verify the registration:
```bash
# Check file type recognition
mdls -name kMDItemContentType test.agent
# Should output: com.nikbrazley.agent

# Test Quick Look
# Select any .agent file in Finder and press Space
```

**Note**: The AgentFileType.app has been created and included in the project. You can move it to `/Applications` if you want to keep it permanently.

## Quick Start

### Creating an Agent File

Create a markdown file with YAML frontmatter:

```yaml
---
agent:
  name: "Python Data Assistant"
  version: "1.0.0"
  description: "Helps with Python data analysis and visualization"
  capabilities: ["data-analysis", "visualization", "machine-learning"]
  coding_languages: ["python"]
  frameworks: ["pandas", "matplotlib", "scikit-learn"]
---

# Python Data Assistant

I'm here to help you with data analysis tasks...
```

### Using the Library

```typescript
import { AgentParser, AgentSearchEngine } from 'agent-frontmatter';

// Parse and validate an agent file
const content = await fs.readFile('my-agent.md', 'utf-8');
const { agentFile, validation } = AgentParser.parseAndValidate(content);

if (validation.valid) {
  console.log('Agent:', agentFile.metadata.name);
} else {
  console.error('Validation errors:', validation.errors);
}

// Search for agents
const searchEngine = new AgentSearchEngine();
searchEngine.addAgent('agent-1', agentFile.metadata);

const results = searchEngine.search({
  query: 'python data',
  filters: {
    coding_languages: ['python'],
    capabilities: ['data-analysis']
  }
});
```

### Using the CLI

```bash
# Validate a single agent file
agent-lint validate my-agent.md

# Lint multiple files
agent-lint lint "agents/**/*.md"

# Auto-fix common issues
agent-lint lint --fix

# Check compatibility
agent-lint check-compat my-agent.md --model claude-3 --context 200000

# Display agent information
agent-lint info my-agent.md
```

## Agent File Schema

### Minimal Example

```yaml
---
agent:
  name: "My Assistant"
---

# My Assistant

Assistant content here...
```

### Complete Example

```yaml
---
agent:
  # Required
  name: "Python Data Science Assistant"
  version: "2.1.0"
  
  # Core Identity
  description: "Specialized assistant for data analysis and ML workflows"
  role: "Data Science Assistant"
  specialization: "Statistical Analysis & ML Model Development"
  
  # Technical Capabilities
  capabilities: ["data-analysis", "visualization", "machine-learning"]
  coding_languages: ["python", "sql", "r"]
  frameworks: ["pandas", "numpy", "scikit-learn", "tensorflow"]
  tools: ["jupyter", "git", "docker"]
  technologies: ["machine-learning", "data-engineering"]
  
  # Domain Expertise
  industries: ["finance", "healthcare"]
  skills: ["statistical-analysis", "predictive-modeling"]
  domains: ["statistics", "mathematics"]
  languages: ["en", "es"]
  
  # Model Configuration
  model_requirements:
    min_context: 8192
    preferred_models: ["claude-3-sonnet", "gpt-4"]
    temperature: 0.1
  parameters:
    max_iterations: 5
    confidence_threshold: 0.8
  
  # Authorship
  author: "Nik Brazley"
  organization: "DataCorp"
  email: "data@example.com"
  license: "MIT"
  created: "2024-01-15T10:30:00Z"
  updated: "2024-06-22T14:20:00Z"
  
  # Discovery
  tags: ["python", "data-science", "ml"]
  category: "Data & Analytics"
  subcategory: "Machine Learning"
  use_cases: ["data-analysis", "predictive-modeling"]
  difficulty: "intermediate"
  
  # Dependencies
  dependencies: ["python>=3.8", "pandas"]
  integrations: ["jupyter", "vscode"]
  requires_internet: true
---

# Python Data Science Assistant

Your specialized assistant for data analysis...
```

## API Reference

### AgentParser

```typescript
class AgentParser {
  // Parse agent file content
  static parse(content: string, filePath?: string): AgentFile
  
  // Validate agent metadata
  static validate(agentFile: AgentFile): ValidationResult
  
  // Parse and validate in one step
  static parseAndValidate(content: string, filePath?: string): {
    agentFile: AgentFile;
    validation: ValidationResult;
  }
  
  // Serialize back to YAML frontmatter
  static serialize(agentFile: AgentFile): string
}
```

### AgentSearchEngine

```typescript
class AgentSearchEngine {
  // Add agent to search index
  addAgent(agentId: string, metadata: AgentMetadata): void
  
  // Search for agents
  search(options: SearchOptions): SearchResult
  
  // Find by specific criteria
  findByCapability(capability: string): AgentMetadata[]
  findByLanguage(language: string): AgentMetadata[]
  findByCategory(category: string): AgentMetadata[]
  
  // Get recommendations
  getRecommendations(useCase: string, limit?: number): AgentMetadata[]
}
```

### VersionManager

```typescript
class VersionManager {
  // Check version compatibility
  static checkCompatibility(
    requiredVersion: string,
    providedVersion: string
  ): VersionCompatibility
  
  // Check model compatibility
  static checkModelCompatibility(
    agent: AgentMetadata,
    model: string,
    contextSize: number
  ): { compatible: boolean; issues: string[] }
  
  // Suggest version bump
  static suggestVersionBump(
    currentVersion: string,
    changes: {
      breakingChanges?: boolean;
      newFeatures?: boolean;
      bugFixes?: boolean;
    }
  ): VersionUpdate
}
```

## Field Reference

### Required Fields

- `name` (string) - The agent's name

### Strongly Recommended

- `version` (string) - Semantic version (e.g., "1.0.0")

### Optional Fields

See the [agent_frontmatter_schema.md]((https://github.com/agentbrazley/dot.agent/blob/v1.0.1/docs/schema.md)) for complete field documentation.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev

# Lint
npm run lint
```

## License

MIT © Nik Brazley

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Support

For issues and feature requests, please use the GitHub issue tracker.
