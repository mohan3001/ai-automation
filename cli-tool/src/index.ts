#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { setupCommand } from './commands/setup';
import { generateCommand } from './commands/generate';
import { modifyCommand } from './commands/modify';
import { runCommand } from './commands/run';
import { analyzeCommand } from './commands/analyze';
import { searchCommand } from './commands/search';
import { statusCommand } from './commands/status';

const program = new Command();

// Display banner
console.log(boxen(
  chalk.blue.bold('🤖 AI-Powered Test Automation Framework'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }
));

program
  .name('ai-test')
  .description('AI-powered test automation CLI tool')
  .version('1.0.0');

// Setup command
program
  .command('setup')
  .description('Setup the AI service and index codebase')
  .option('-p, --path <path>', 'Path to codebase', '.')
  .option('-m, --model <model>', 'Ollama model to use', 'mistral')
  .action(setupCommand);

// Generate command
program
  .command('generate')
  .description('Generate a new test')
  .argument('<requirements>', 'Test requirements in natural language')
  .option('-c, --context <context>', 'Additional context for generation')
  .option('-o, --output <dir>', 'Output directory for generated test', 'tests')
  .option('--no-approval', 'Skip approval workflow')
  .action(generateCommand);

// Modify command
program
  .command('modify')
  .description('Modify an existing test')
  .argument('<file>', 'Path to test file')
  .argument('<request>', 'Modification request')
  .option('--no-approval', 'Skip approval workflow')
  .action(modifyCommand);

// Run command
program
  .command('run')
  .description('Run tests')
  .option('-t, --test <pattern>', 'Test pattern to run')
  .option('-p, --project <project>', 'Playwright project to run')
  .option('--headed', 'Run in headed mode')
  .option('--debug', 'Run in debug mode')
  .action(runCommand);

// Analyze command
program
  .command('analyze')
  .description('Analyze test code')
  .argument('<file>', 'Path to test file')
  .action(analyzeCommand);

// Search command
program
  .command('search')
  .description('Search for tests in codebase')
  .argument('<query>', 'Search query')
  .option('-n, --num <number>', 'Number of results', '10')
  .action(searchCommand);

// Status command
program
  .command('status')
  .description('Check service status')
  .action(statusCommand);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (err) {
  if (err instanceof Error) {
    console.error(chalk.red('Error:'), err.message);
  }
  process.exit(1);
} 