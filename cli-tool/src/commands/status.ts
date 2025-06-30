import axios from 'axios';
import chalk from 'chalk';
import { CommandOptions } from '../types';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

export async function statusCommand(options: CommandOptions) {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`);
    const result = response.data;
    
    console.log(chalk.blue.bold('AI Test Automation Service Status:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const status = result.status === 'healthy' 
      ? chalk.green('✓ Healthy') 
      : chalk.red('✗ Unhealthy');
    console.log(`Service: ${status}`);
    console.log(`Version: ${result.version}`);
    console.log(`AI Service Available: ${result.ai_service_available ? chalk.green('Yes') : chalk.red('No')}`);
    
    if (!result.ai_service_available) {
      console.log(chalk.yellow('\n⚠️  AI features are limited. Run setup to enable full functionality.'));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Cannot connect to AI service.'));
    console.log(chalk.yellow('  → Make sure the AI service is running:'));
    console.log(chalk.gray('    cd ai-automation/ai-service/src'));
    console.log(chalk.gray('    ../venv/bin/uvicorn api_server:app --reload --host 0.0.0.0 --port 8000'));
  }
} 