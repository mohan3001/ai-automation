import chalk from 'chalk';
import { glob } from 'glob';
import path from 'path';
import { CommandOptions } from '../types';

export async function listCommand(options: CommandOptions) {
  console.log(chalk.blue.bold('\n📋 Listing All Test Files\n'));
  
  try {
    // Get the project root (two levels up from cli-tool)
    const projectRoot = path.resolve(__dirname, '../../..');
    const playwrightDir = path.join(projectRoot, 'playwright-framework');
    
    // Find all .spec.ts files in test directories
    const testPatterns = [
      path.join(playwrightDir, 'tests/**/*.spec.ts'),
      path.join(playwrightDir, 'tests-examples/**/*.spec.ts'),
      path.join(playwrightDir, '**/tests/**/*.spec.ts')
    ];
    
    const allTestFiles: string[] = [];
    
    for (const pattern of testPatterns) {
      const files = await glob(pattern, { absolute: true });
      allTestFiles.push(...files);
    }
    
    // Remove duplicates and sort
    const uniqueFiles = [...new Set(allTestFiles)].sort();
    
    if (uniqueFiles.length === 0) {
      console.log(chalk.yellow('⚠️  No test files found.'));
      return;
    }
    
    console.log(chalk.green(`Found ${uniqueFiles.length} test file(s):\n`));
    
    // Group files by directory
    const filesByDir: { [dir: string]: string[] } = {};
    
    for (const file of uniqueFiles) {
      const relativePath = path.relative(projectRoot, file);
      const dir = path.dirname(relativePath);
      
      if (!filesByDir[dir]) {
        filesByDir[dir] = [];
      }
      filesByDir[dir].push(path.basename(file));
    }
    
    // Display files grouped by directory
    for (const [dir, files] of Object.entries(filesByDir)) {
      console.log(chalk.cyan.bold(`📁 ${dir}/`));
      
      for (const file of files.sort()) {
        console.log(chalk.white(`  📄 ${file}`));
      }
      console.log('');
    }
    
    // Summary
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue.bold(`Total: ${uniqueFiles.length} test files`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error listing test files:'), error);
  }
} 