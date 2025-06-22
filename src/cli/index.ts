#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { AgentParser } from '../parser';
import { VersionManager } from '../utils/version';
import type { ValidationResult } from '../types/agent';

const program = new Command();

program
  .name('agent-lint')
  .description('CLI tool for validating and linting agent files')
  .version('0.1.0');

// Validate command
program
  .command('validate <file>')
  .description('Validate an agent file')
  .option('-v, --verbose', 'Show detailed validation output')
  .action(async (file: string, options: { verbose?: boolean }) => {
    const spinner = ora('Validating agent file...').start();
    
    try {
      const content = await fs.readFile(file, 'utf-8');
      const { agentFile, validation } = AgentParser.parseAndValidate(content, file);
      
      spinner.stop();
      
      if (validation.valid) {
        console.log(chalk.green('✓'), chalk.bold('Valid agent file'));
        console.log(chalk.gray('  Name:'), agentFile.metadata.name);
        if (agentFile.metadata.version) {
          console.log(chalk.gray('  Version:'), agentFile.metadata.version);
        }
        
        if (validation.warnings.length > 0) {
          console.log('\n' + chalk.yellow('Warnings:'));
          validation.warnings.forEach(warning => {
            console.log(chalk.yellow('  ⚠'), warning.field + ':', warning.message);
            if (warning.suggestion && options.verbose) {
              console.log(chalk.gray('    →'), warning.suggestion);
            }
          });
        }
      } else {
        console.log(chalk.red('✗'), chalk.bold('Invalid agent file'));
        console.log('\n' + chalk.red('Errors:'));
        validation.errors.forEach(error => {
          console.log(chalk.red('  ✗'), error.field + ':', error.message);
        });
        
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Failed to validate file');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Lint command (validate multiple files)
program
  .command('lint [pattern]')
  .description('Lint multiple agent files')
  .option('-f, --fix', 'Auto-fix minor issues')
  .option('-q, --quiet', 'Only show errors')
  .action(async (pattern: string = '**/*.agent', options: { fix?: boolean; quiet?: boolean }) => {
    const spinner = ora('Finding agent files...').start();
    
    try {
      const files = await glob(pattern);
      spinner.text = `Found ${files.length} agent files`;
      
      let totalErrors = 0;
      let totalWarnings = 0;
      const results: Array<{
        file: string;
        validation: ValidationResult;
        fixed?: boolean;
      }> = [];
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const { agentFile, validation } = AgentParser.parseAndValidate(content, file);
          
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
              const newContent = AgentParser.serialize(agentFile);
              await fs.writeFile(file, newContent);
            }
          }
          
          totalErrors += validation.errors.length;
          totalWarnings += validation.warnings.length;
          results.push({ file, validation, fixed });
        } catch (error) {
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
        console.log('\n' + chalk.bold('Lint Results:'));
        console.log(chalk.gray('─'.repeat(50)));
      }
      
      for (const result of results) {
        const hasIssues = result.validation.errors.length > 0 || 
                         (!options.quiet && result.validation.warnings.length > 0);
        
        if (hasIssues) {
          const status = result.validation.valid ? chalk.yellow('⚠') : chalk.red('✗');
          console.log(`\n${status} ${chalk.bold(result.file)}`);
          
          if (result.fixed) {
            console.log(chalk.green('  ✓ Auto-fixed issues'));
          }
          
          result.validation.errors.forEach(error => {
            console.log(chalk.red('  Error:'), error.field + ':', error.message);
          });
          
          if (!options.quiet) {
            result.validation.warnings.forEach(warning => {
              console.log(chalk.yellow('  Warning:'), warning.field + ':', warning.message);
            });
          }
        }
      }
      
      // Summary
      console.log('\n' + chalk.gray('─'.repeat(50)));
      if (totalErrors === 0) {
        console.log(chalk.green('✓'), 'All files passed validation');
      } else {
        console.log(chalk.red('✗'), `${totalErrors} errors found`);
      }
      
      if (!options.quiet && totalWarnings > 0) {
        console.log(chalk.yellow('⚠'), `${totalWarnings} warnings found`);
      }
      
      if (totalErrors > 0) {
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Failed to lint files');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
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
  .action(async (file: string, options: { 
    model?: string; 
    context?: string; 
    version?: string;
  }) => {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const { agentFile } = AgentParser.parseAndValidate(content, file);
      
      console.log(chalk.bold('Compatibility Check:'));
      console.log(chalk.gray('Agent:'), agentFile.metadata.name);
      
      // Check model compatibility
      if (options.model && options.context) {
        const contextSize = parseInt(options.context);
        const modelCompat = VersionManager.checkModelCompatibility(
          agentFile.metadata,
          options.model,
          contextSize
        );
        
        console.log('\n' + chalk.bold('Model Compatibility:'));
        if (modelCompat.compatible) {
          console.log(chalk.green('✓'), 'Compatible with', options.model);
        } else {
          console.log(chalk.red('✗'), 'Not compatible with', options.model);
          modelCompat.issues.forEach(issue => {
            console.log(chalk.red('  -'), issue);
          });
        }
      }
      
      // Check version compatibility
      if (options.version && agentFile.metadata.version) {
        const versionCompat = VersionManager.checkCompatibility(
          options.version,
          agentFile.metadata.version
        );
        
        console.log('\n' + chalk.bold('Version Compatibility:'));
        if (versionCompat.compatible) {
          console.log(chalk.green('✓'), 'Version compatible');
        } else {
          console.log(chalk.red('✗'), versionCompat.reason);
          if (versionCompat.suggestedVersion) {
            console.log(chalk.yellow('  →'), 'Suggested:', versionCompat.suggestedVersion);
          }
        }
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Info command
program
  .command('info <file>')
  .description('Display detailed information about an agent')
  .action(async (file: string) => {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const { agentFile } = AgentParser.parseAndValidate(content, file);
      const metadata = agentFile.metadata;
      
      console.log(chalk.bold.blue('\n═══ Agent Information ═══\n'));
      
      // Basic info
      console.log(chalk.bold('Basic:'));
      console.log('  Name:', chalk.cyan(metadata.name));
      if (metadata.version) console.log('  Version:', chalk.cyan(metadata.version));
      if (metadata.description) console.log('  Description:', metadata.description);
      if (metadata.role) console.log('  Role:', metadata.role);
      
      // Technical capabilities
      if (metadata.capabilities || metadata.coding_languages || metadata.frameworks) {
        console.log('\n' + chalk.bold('Technical:'));
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
        console.log('\n' + chalk.bold('Model Requirements:'));
        const reqs = metadata.model_requirements;
        if (reqs.min_context) console.log('  Min Context:', reqs.min_context);
        if (reqs.preferred_models?.length) {
          console.log('  Preferred Models:', reqs.preferred_models.join(', '));
        }
        if (reqs.temperature !== undefined) {
          console.log('  Temperature:', reqs.temperature);
        }
      }
      
      // Authorship
      if (metadata.author || metadata.organization) {
        console.log('\n' + chalk.bold('Authorship:'));
        if (metadata.author) console.log('  Author:', metadata.author);
        if (metadata.organization) console.log('  Organization:', metadata.organization);
        if (metadata.license) console.log('  License:', metadata.license);
      }
      
      // Discovery
      if (metadata.tags?.length || metadata.use_cases?.length) {
        console.log('\n' + chalk.bold('Discovery:'));
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
      
      console.log(chalk.bold.blue('\n════════════════════════\n'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse(process.argv);