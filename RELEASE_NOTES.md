# Release v1.0.0 - Agent File Type System

## 🎉 First Release

This is the initial release of the `.agent` file type system, providing a standardized format for AI agent definitions with YAML frontmatter.

## ✨ Features

### Core Functionality
- **YAML Frontmatter Parsing**: Parse and validate agent metadata using gray-matter
- **Schema Validation**: Comprehensive Zod schema for type-safe agent definitions
- **Semantic Versioning**: Built-in support for version management and compatibility checking
- **Agent Discovery**: Search and filter agents by capabilities, name, or version

### Developer Tools
- **CLI Tool**: Command-line interface for validating `.agent` files
  ```bash
  agent-validator validate myagent.agent
  agent-validator lint --fix myagent.agent
  ```
- **TypeScript Support**: Full TypeScript types and interfaces
- **Extensible Architecture**: Easy to extend with custom validators and parsers

### macOS Integration
- **Quick Look Support**: Preview `.agent` files in Finder (macOS)
- **File Type Registration**: DotAgent.app registers the `.agent` extension system-wide
- **Native File Association**: Double-click to open in your default text editor

### Editor Support
- **VSCode Extension**: Syntax highlighting for `.agent` files
- **TextMate Grammar**: Proper syntax coloring for frontmatter and content

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dot.agent.git
cd dot.agent

# Install dependencies
npm install

# Build the project
npm run build

# Link CLI globally (optional)
npm link
```

### macOS Quick Look Setup
1. Double-click `DotAgent.app` to register the file type
2. Quick Look (spacebar preview) will now work for all `.agent` files

## 📖 Usage

### Creating an Agent File
```yaml
---
name: MyAgent
version: 1.0.0
description: An example agent
author: Your Name
capabilities:
  - text-generation
  - code-analysis
---

# Agent Content
Your agent documentation and implementation details go here.
```

### Validating Files
```bash
# Validate a single file
agent-validator validate myagent.agent

# Validate all agents in a directory
agent-validator validate ./agents

# Lint and fix issues
agent-validator lint --fix myagent.agent
```

## 🔧 Schema Fields

### Required Fields
- `name`: Unique identifier for the agent

### Recommended Fields  
- `version`: Semantic version (e.g., "1.0.0")
- `description`: Brief description of the agent's purpose
- `author`: Creator's name

### Optional Fields
- `capabilities`: Array of agent capabilities
- `dependencies`: Other agents or systems required
- `tags`: Categorization tags
- `created`/`updated`: ISO 8601 timestamps
- `homepage`: Project or documentation URL
- And many more...

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Created by Nik Brazley