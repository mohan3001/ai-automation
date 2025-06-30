import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { CommandOptions } from '../types';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

// Function to check if a file is a test file
function isTestFile(filePath: string, nodeType: string): boolean {
  const testPatterns = [
    /\.spec\.(ts|js|tsx|jsx)$/i,
    /\.test\.(ts|js|tsx|jsx)$/i,
    /test.*\.(ts|js|tsx|jsx)$/i,
    /.*test.*\.(ts|js|tsx|jsx)$/i
  ];
  
  const excludePatterns = [
    /\.py$/i,
    /\.json$/i,
    /\.md$/i,
    /\.config\./i,
    /package-lock\.json$/i,
    /node_modules/i,
    /__pycache__/i,
    /\.git/i,
    /venv/i,
    /\.env/i
  ];
  
  // Check if file should be excluded
  for (const pattern of excludePatterns) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  
  // Check if file is a test file
  for (const pattern of testPatterns) {
    if (pattern.test(filePath)) {
      return true;
    }
  }
  
  // Also check if the content contains test-related keywords
  return nodeType === 'text_chunk' && (
    filePath.includes('test') || 
    filePath.includes('spec') ||
    filePath.includes('tests/')
  );
}

export async function searchCommand(query: string, options: CommandOptions) {
  const spinner = ora('Searching for tests...').start();
  
  try {
    // Call the AI service search endpoint
    const response = await axios.post(`${AI_SERVICE_URL}/search-tests`, {
      query: query,
      n_results: parseInt(options.num || '10')
    });

    const result = response.data;
    
    spinner.succeed('Search completed!');
    
    if (!result.results || result.results.length === 0) {
      console.log(chalk.yellow('\n⚠️  No tests found matching your query.'));
      return;
    }
    
    // Filter results to only show test files
    const testFiles = result.results.filter((test: any) => {
      const metadata = test.metadata || {};
      const filePath = metadata.file_path || 'Unknown file';
      const nodeType = metadata.node_type || 'unknown';
      return isTestFile(filePath, nodeType);
    });

    // Deduplicate by file path
    const uniqueFilesMap = new Map();
    testFiles.forEach((test: any) => {
      const metadata = test.metadata || {};
      const filePath = metadata.file_path || 'Unknown file';
      if (!uniqueFilesMap.has(filePath)) {
        uniqueFilesMap.set(filePath, test);
      }
    });
    const uniqueTestFiles = Array.from(uniqueFilesMap.values());
    
    if (uniqueTestFiles.length === 0) {
      console.log(chalk.yellow('\n⚠️  No test files found matching your query.'));
      return;
    }
    
    console.log('\n' + chalk.blue.bold(`Found ${uniqueTestFiles.length} unique test file(s):`));
    console.log(chalk.gray('─'.repeat(80)));
    
    uniqueTestFiles.forEach((test: any, index: number) => {
      const metadata = test.metadata || {};
      const filePath = metadata.file_path || 'Unknown file';
      const nodeType = metadata.node_type || 'unknown';
      const language = metadata.language || 'unknown';
      
      console.log(chalk.bold(`${index + 1}. ${filePath}`));
      console.log(chalk.gray(`   Type: ${nodeType} | Language: ${language}`));
      
      // Show a preview of the content (first 200 characters)
      const preview = test.content ? test.content.substring(0, 200) + '...' : 'No content available';
      console.log(chalk.gray(`   Preview: ${preview}`));
      console.log('');
    });
    
  } catch (error) {
    spinner.fail('Search failed');
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.red('\n❌ Cannot connect to AI service.'));
        console.log(chalk.yellow('  → Make sure the AI service is running:'));
        console.log(chalk.gray('    cd ai-automation/ai-service/src'));
        console.log(chalk.gray('    ../venv/bin/uvicorn api_server:app --reload --host 0.0.0.0 --port 8000'));
      } else if (error.response?.status === 503) {
        console.log(chalk.red('\n❌ AI Service not available.'));
        console.log(chalk.yellow('  → Run setup first: ./dist/index.js setup'));
      } else {
        console.log(chalk.red(`\n❌ API Error: ${error.response?.data?.detail || error.message}`));
      }
    } else {
      console.log(chalk.red(`\n❌ Unexpected error: ${error}`));
    }
    
    process.exit(1);
  }
} 