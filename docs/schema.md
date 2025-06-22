# Agent File Type Schema Documentation

## Overview

The `.agent` file format uses YAML frontmatter to define metadata for AI agents. Files consist of YAML frontmatter (between `---` delimiters) followed by optional Markdown content.

## File Structure

```yaml
---
# YAML frontmatter with agent metadata
name: AgentName
version: 1.0.0
# ... other fields
---

# Optional Markdown content
Agent documentation, instructions, or implementation details.
```

## Schema Fields

### Required Fields

#### `name` (string)
**Required.** The unique identifier for the agent.
- Must be a non-empty string
- Should be descriptive and unique
- Example: `"DataAnalysisAgent"`

### Recommended Fields

#### `version` (string)
**Recommended.** Semantic version of the agent.
- Must follow semantic versioning format (e.g., "1.0.0", "2.1.0-beta")
- Used for version compatibility and updates
- Example: `"1.2.3"`

#### `description` (string)
**Recommended.** Brief description of the agent's purpose.
- Should be a single line summary
- Maximum 200 characters recommended
- Example: `"Analyzes data patterns and generates insights"`

#### `author` (string)
**Recommended.** Name of the agent's creator.
- Can include email in format "Name <email>"
- Example: `"Nik Brazley"` or `"Nik Brazley <nik@example.com>"`

### Optional Fields

#### `homepage` (string)
URL to the agent's homepage or documentation.
- Must be a valid URL
- Example: `"https://github.com/nikbrazley/myagent"`

#### `repository` (string)
URL to the source code repository.
- Must be a valid URL
- Example: `"https://github.com/nikbrazley/myagent"`

#### `license` (string)
SPDX license identifier or custom license.
- Prefer standard SPDX identifiers
- Example: `"MIT"`, `"Apache-2.0"`, `"GPL-3.0"`

#### `tags` (array of strings)
Categorization tags for the agent.
- Each tag should be lowercase
- Use hyphens for multi-word tags
- Example: `["data-analysis", "nlp", "automation"]`

#### `capabilities` (array of strings)
List of agent capabilities.
- Describe what the agent can do
- Use consistent naming conventions
- Example:
  ```yaml
  capabilities:
    - text-generation
    - code-analysis
    - data-visualization
  ```

#### `dependencies` (object)
External dependencies required by the agent.
- Key: dependency name
- Value: version specification
- Example:
  ```yaml
  dependencies:
    openai: "^1.0.0"
    pandas: ">=2.0.0"
    numpy: "*"
  ```

#### `created` (string)
ISO 8601 timestamp of creation.
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `"2025-06-22T10:30:00Z"`

#### `updated` (string)
ISO 8601 timestamp of last update.
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `"2025-06-22T15:45:00Z"`

#### `deprecated` (boolean)
Indicates if the agent is deprecated.
- Default: `false`
- Example: `true`

#### `parameters` (object)
Configuration parameters for the agent.
- Flexible object structure
- Example:
  ```yaml
  parameters:
    temperature: 0.7
    max_tokens: 1000
    model: gpt-4
  ```

#### `examples` (array of objects)
Usage examples for the agent.
- Each example should have `input` and `output`
- Example:
  ```yaml
  examples:
    - input: "Analyze sales data for Q1"
      output: "Sales increased by 15%..."
  ```

#### `interfaces` (array of strings)
Supported interfaces or protocols.
- Example: `["rest-api", "cli", "websocket"]`

#### `platforms` (array of strings)
Supported platforms.
- Example: `["windows", "macos", "linux", "web"]`

#### `requirements` (object)
System requirements.
- Example:
  ```yaml
  requirements:
    python: ">=3.8"
    memory: "4GB"
    gpu: false
  ```

#### `environment` (object)
Environment variables used by the agent.
- Key: variable name
- Value: description or default
- Example:
  ```yaml
  environment:
    API_KEY: "OpenAI API key"
    DEBUG: "false"
  ```

#### `configuration` (object)
Agent-specific configuration.
- Flexible structure based on agent needs
- Example:
  ```yaml
  configuration:
    timeout: 30
    retries: 3
    cache_enabled: true
  ```

#### `metrics` (object)
Performance or quality metrics.
- Example:
  ```yaml
  metrics:
    accuracy: 0.95
    response_time: "< 2s"
    tokens_per_second: 50
  ```

#### `changelog` (string or array)
Recent changes or version history.
- Can be a string or array of entries
- Example:
  ```yaml
  changelog:
    - "1.2.0: Added streaming support"
    - "1.1.0: Improved error handling"
  ```

#### `keywords` (array of strings)
SEO/search keywords.
- Similar to tags but for discovery
- Example: `["ai", "assistant", "chatbot"]`

## Complete Example

```yaml
---
name: DataAnalysisAgent
version: 2.1.0
description: Advanced data analysis agent with ML capabilities
author: Nik Brazley
homepage: https://github.com/nikbrazley/data-agent
repository: https://github.com/nikbrazley/data-agent
license: MIT
created: 2025-01-15T10:00:00Z
updated: 2025-06-22T16:00:00Z
tags:
  - data-analysis
  - machine-learning
  - visualization
capabilities:
  - statistical-analysis
  - predictive-modeling
  - data-visualization
  - report-generation
dependencies:
  pandas: "^2.0.0"
  scikit-learn: "^1.3.0"
  matplotlib: "^3.7.0"
parameters:
  default_model: "random_forest"
  confidence_threshold: 0.95
interfaces:
  - rest-api
  - python-sdk
  - cli
platforms:
  - linux
  - macos
  - windows
requirements:
  python: ">=3.8"
  memory: "8GB"
  storage: "10GB"
---

# Data Analysis Agent

This agent provides comprehensive data analysis capabilities including statistical analysis, machine learning, and visualization.

## Usage

```python
from agents import DataAnalysisAgent

agent = DataAnalysisAgent()
results = agent.analyze(data)
```
```

## Validation

Files can be validated using the agent-validator CLI tool:

```bash
agent-validator validate myagent.agent
```

## Media Type

The official IANA media type for agent files is:
```
application/vnd.agent+yaml
```

## File Extension

All agent files must use the `.agent` extension.