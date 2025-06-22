#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const promises_1 = __importDefault(require("fs/promises"));
const glob_1 = require("glob");
const parser_1 = require("../parser");
const version_1 = require("../utils/version");
const program = new commander_1.Command();
program
    .name('agent-lint')
    .description('CLI tool for validating and linting agent files')
    .version('0.1.0');
// Validate command
program
    .command('validate <file>')
    .description('Validate an agent file')
    .option('-v, --verbose', 'Show detailed validation output')
    .action(async (file, options) => {
    const spinner = (0, ora_1.default)('Validating agent file...').start();
    try {
        const content = await promises_1.default.readFile(file, 'utf-8');
        const { agentFile, validation } = parser_1.AgentParser.parseAndValidate(content, file);
        spinner.stop();
        if (validation.valid) {
            console.log(chalk_1.default.green('✓'), chalk_1.default.bold('Valid agent file'));
            console.log(chalk_1.default.gray('  Name:'), agentFile.metadata.name);
            if (agentFile.metadata.version) {
                console.log(chalk_1.default.gray('  Version:'), agentFile.metadata.version);
            }
            if (validation.warnings.length > 0) {
                console.log('\n' + chalk_1.default.yellow('Warnings:'));
                validation.warnings.forEach(warning => {
                    console.log(chalk_1.default.yellow('  ⚠'), warning.field + ':', warning.message);
                    if (warning.suggestion && options.verbose) {
                        console.log(chalk_1.default.gray('    →'), warning.suggestion);
                    }
                });
            }
        }
        else {
            console.log(chalk_1.default.red('✗'), chalk_1.default.bold('Invalid agent file'));
            console.log('\n' + chalk_1.default.red('Errors:'));
            validation.errors.forEach(error => {
                console.log(chalk_1.default.red('  ✗'), error.field + ':', error.message);
            });
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail('Failed to validate file');
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
// Lint command (validate multiple files)
program
    .command('lint [pattern]')
    .description('Lint multiple agent files')
    .option('-f, --fix', 'Auto-fix minor issues')
    .option('-q, --quiet', 'Only show errors')
    .action(async (pattern = '**/*.agent', options) => {
    const spinner = (0, ora_1.default)('Finding agent files...').start();
    try {
        const files = await (0, glob_1.glob)(pattern);
        spinner.text = `Found ${files.length} agent files`;
        let totalErrors = 0;
        let totalWarnings = 0;
        const results = [];
        for (const file of files) {
            try {
                const content = await promises_1.default.readFile(file, 'utf-8');
                const { agentFile, validation } = parser_1.AgentParser.parseAndValidate(content, file);
                let fixed = false;
                if (options.fix && validation.warnings.length > 0) {
                    // Auto-fix: Add version if missing
                    if (!agentFile.metadata.version &&
                        validation.warnings.some(w => w.field === 'version')) {
                        agentFile.metadata.version = '1.0.0';
                        fixed = true;
                    }
                    // Write fixed content
                    if (fixed) {
                        const newContent = parser_1.AgentParser.serialize(agentFile);
                        await promises_1.default.writeFile(file, newContent);
                    }
                }
                totalErrors += validation.errors.length;
                totalWarnings += validation.warnings.length;
                results.push({ file, validation, fixed });
            }
            catch (error) {
                totalErrors++;
                results.push({
                    file,
                    validation: {
                        valid: false,
                        errors: [{
                                field: 'file',
                                message: error instanceof Error ? error.message : 'Unknown error'
                            }],
                        warnings: []
                    }
                });
            }
        }
        spinner.stop();
        // Display results
        if (!options.quiet || totalErrors > 0) {
            console.log('\n' + chalk_1.default.bold('Lint Results:'));
            console.log(chalk_1.default.gray('─'.repeat(50)));
        }
        for (const result of results) {
            const hasIssues = result.validation.errors.length > 0 ||
                (!options.quiet && result.validation.warnings.length > 0);
            if (hasIssues) {
                const status = result.validation.valid ? chalk_1.default.yellow('⚠') : chalk_1.default.red('✗');
                console.log(`\n${status} ${chalk_1.default.bold(result.file)}`);
                if (result.fixed) {
                    console.log(chalk_1.default.green('  ✓ Auto-fixed issues'));
                }
                result.validation.errors.forEach(error => {
                    console.log(chalk_1.default.red('  Error:'), error.field + ':', error.message);
                });
                if (!options.quiet) {
                    result.validation.warnings.forEach(warning => {
                        console.log(chalk_1.default.yellow('  Warning:'), warning.field + ':', warning.message);
                    });
                }
            }
        }
        // Summary
        console.log('\n' + chalk_1.default.gray('─'.repeat(50)));
        if (totalErrors === 0) {
            console.log(chalk_1.default.green('✓'), 'All files passed validation');
        }
        else {
            console.log(chalk_1.default.red('✗'), `${totalErrors} errors found`);
        }
        if (!options.quiet && totalWarnings > 0) {
            console.log(chalk_1.default.yellow('⚠'), `${totalWarnings} warnings found`);
        }
        if (totalErrors > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail('Failed to lint files');
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
// Check compatibility command
program
    .command('check-compat <file>')
    .description('Check agent compatibility with model/version requirements')
    .option('-m, --model <model>', 'Model to check against')
    .option('-c, --context <size>', 'Context size to check against')
    .option('-v, --version <version>', 'Version requirement to check')
    .action(async (file, options) => {
    try {
        const content = await promises_1.default.readFile(file, 'utf-8');
        const { agentFile } = parser_1.AgentParser.parseAndValidate(content, file);
        console.log(chalk_1.default.bold('Compatibility Check:'));
        console.log(chalk_1.default.gray('Agent:'), agentFile.metadata.name);
        // Check model compatibility
        if (options.model && options.context) {
            const contextSize = parseInt(options.context);
            const modelCompat = version_1.VersionManager.checkModelCompatibility(agentFile.metadata, options.model, contextSize);
            console.log('\n' + chalk_1.default.bold('Model Compatibility:'));
            if (modelCompat.compatible) {
                console.log(chalk_1.default.green('✓'), 'Compatible with', options.model);
            }
            else {
                console.log(chalk_1.default.red('✗'), 'Not compatible with', options.model);
                modelCompat.issues.forEach(issue => {
                    console.log(chalk_1.default.red('  -'), issue);
                });
            }
        }
        // Check version compatibility
        if (options.version && agentFile.metadata.version) {
            const versionCompat = version_1.VersionManager.checkCompatibility(options.version, agentFile.metadata.version);
            console.log('\n' + chalk_1.default.bold('Version Compatibility:'));
            if (versionCompat.compatible) {
                console.log(chalk_1.default.green('✓'), 'Version compatible');
            }
            else {
                console.log(chalk_1.default.red('✗'), versionCompat.reason);
                if (versionCompat.suggestedVersion) {
                    console.log(chalk_1.default.yellow('  →'), 'Suggested:', versionCompat.suggestedVersion);
                }
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
// Info command
program
    .command('info <file>')
    .description('Display detailed information about an agent')
    .action(async (file) => {
    try {
        const content = await promises_1.default.readFile(file, 'utf-8');
        const { agentFile } = parser_1.AgentParser.parseAndValidate(content, file);
        const metadata = agentFile.metadata;
        console.log(chalk_1.default.bold.blue('\n═══ Agent Information ═══\n'));
        // Basic info
        console.log(chalk_1.default.bold('Basic:'));
        console.log('  Name:', chalk_1.default.cyan(metadata.name));
        if (metadata.version)
            console.log('  Version:', chalk_1.default.cyan(metadata.version));
        if (metadata.description)
            console.log('  Description:', metadata.description);
        if (metadata.role)
            console.log('  Role:', metadata.role);
        // Technical capabilities
        if (metadata.capabilities || metadata.coding_languages || metadata.frameworks) {
            console.log('\n' + chalk_1.default.bold('Technical:'));
            if (metadata.capabilities?.length) {
                console.log('  Capabilities:', metadata.capabilities.join(', '));
            }
            if (metadata.coding_languages?.length) {
                console.log('  Languages:', metadata.coding_languages.join(', '));
            }
            if (metadata.frameworks?.length) {
                console.log('  Frameworks:', metadata.frameworks.join(', '));
            }
        }
        // Model requirements
        if (metadata.model_requirements) {
            console.log('\n' + chalk_1.default.bold('Model Requirements:'));
            const reqs = metadata.model_requirements;
            if (reqs.min_context)
                console.log('  Min Context:', reqs.min_context);
            if (reqs.preferred_models?.length) {
                console.log('  Preferred Models:', reqs.preferred_models.join(', '));
            }
            if (reqs.temperature !== undefined) {
                console.log('  Temperature:', reqs.temperature);
            }
        }
        // Authorship
        if (metadata.author || metadata.organization) {
            console.log('\n' + chalk_1.default.bold('Authorship:'));
            if (metadata.author)
                console.log('  Author:', metadata.author);
            if (metadata.organization)
                console.log('  Organization:', metadata.organization);
            if (metadata.license)
                console.log('  License:', metadata.license);
        }
        // Discovery
        if (metadata.tags?.length || metadata.use_cases?.length) {
            console.log('\n' + chalk_1.default.bold('Discovery:'));
            if (metadata.tags?.length) {
                console.log('  Tags:', metadata.tags.join(', '));
            }
            if (metadata.use_cases?.length) {
                console.log('  Use Cases:', metadata.use_cases.join(', '));
            }
            if (metadata.difficulty) {
                console.log('  Difficulty:', metadata.difficulty);
            }
        }
        console.log(chalk_1.default.bold.blue('\n════════════════════════\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map