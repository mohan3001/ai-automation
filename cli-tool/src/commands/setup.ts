import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { CommandOptions } from '../types';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

export async function setupCommand(options: CommandOptions) {
  const spinner = ora('Setting up AI service...').start();
  
  try {
    // Call the AI service setup endpoint
    const response = await axios.post(`${AI_SERVICE_URL}/setup`, {
      codebase_path: options.path || '.'
    });

    const result = response.data;
    
    spinner.succeed('AI service setup completed!');
    
    console.log('\n' + chalk.blue.bold('Setup Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Display LLM status
    if (result.llm_status) {
      const llmStatus = result.llm_status.status === 'healthy' 
        ? chalk.green('✓ Healthy') 
        : chalk.red('✗ Unavailable');
      console.log(`LLM Service: ${llmStatus}`);
      
      if (result.llm_status.status !== 'healthy') {
        console.log(chalk.yellow('  → Make sure Ollama is running with the specified model'));
      }
    }
    
    // Display indexing status
    if (result.indexing_status) {
      if (result.indexing_status.error) {
        console.log(`Codebase Indexing: ${chalk.red('✗ Failed')}`);
        console.log(chalk.red(`  → ${result.indexing_status.error}`));
      } else {
        console.log(`Codebase Indexing: ${chalk.green('✓ Completed')}`);
        if (result.indexing_status.files_processed) {
          console.log(`  → Processed ${result.indexing_status.files_processed} files`);
        }
      }
    }
    
    // Display overall status
    console.log('\n' + chalk.bold('Overall Status:'));
    const overallStatus = result.overall_status === 'ready' 
      ? chalk.green('✓ Ready') 
      : chalk.yellow('⚠ Limited');
    console.log(`Service: ${overallStatus}`);
    
    if (result.overall_status === 'ready') {
      console.log(chalk.green('\n🎉 AI service is ready to generate and analyze tests!'));
    } else if (result.overall_status === 'llm_unavailable') {
      console.log(chalk.yellow('\n⚠️  LLM is unavailable. Some features will be limited.'));
      console.log(chalk.gray('  → Start Ollama: ollama run mistral'));
    } else {
      console.log(chalk.yellow('\n⚠️  Setup completed with some issues.'));
    }
    
  } catch (error) {
    spinner.fail('Setup failed');
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.red('\n❌ Cannot connect to AI service.'));
        console.log(chalk.yellow('  → Make sure the AI service is running:'));
        console.log(chalk.gray('    cd ai-automation/ai-service/src'));
        console.log(chalk.gray('    ../venv/bin/uvicorn api_server:app --reload --host 0.0.0.0 --port 8000'));
      } else {
        console.log(chalk.red(`\n❌ API Error: ${error.response?.data?.detail || error.message}`));
      }
    } else {
      console.log(chalk.red(`\n❌ Unexpected error: ${error}`));
    }
    
    process.exit(1);
  }
} 