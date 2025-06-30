import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { CommandOptions } from '../types';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

export async function generateCommand(requirements: string, options: CommandOptions) {
  const spinner = ora('Generating test...').start();
  
  try {
    // Call the AI service generate endpoint
    const response = await axios.post(`${AI_SERVICE_URL}/generate-test`, {
      requirements: requirements,
      context_query: options.context
    });

    const result = response.data;
    
    if (!result.success) {
      spinner.fail('Test generation failed');
      console.log(chalk.red(`\n❌ ${result.error}`));
      process.exit(1);
    }
    
    spinner.succeed('Test generated successfully!');
    
    // Display the generated code
    console.log('\n' + chalk.blue.bold('Generated Test:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(result.content);
    
    // Validate the generated code
    if (result.validation) {
      console.log('\n' + chalk.blue.bold('Validation:'));
      if (result.validation.valid) {
        console.log(chalk.green('✓ Code is valid'));
      } else {
        console.log(chalk.red('✗ Code has issues:'));
        result.validation.issues.forEach((issue: string) => {
          console.log(chalk.red(`  → ${issue}`));
        });
      }
      
      if (result.validation.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Warnings:'));
        result.validation.warnings.forEach((warning: string) => {
          console.log(chalk.yellow(`  → ${warning}`));
        });
      }
    }
    
    // Handle approval workflow
    if (options.approval !== false) {
      console.log('\n' + chalk.blue.bold('Approval:'));
      console.log(chalk.gray('Do you want to save this test? (y/n)'));
      
      // For now, auto-approve. In a real implementation, you'd use inquirer
      const shouldSave = true; // This would be user input
      
      if (shouldSave) {
        // Save the test
        const outputDir = options.output || 'tests';
        const testName = `generated-test-${Date.now()}`;
        
        const saveResponse = await axios.post(`${AI_SERVICE_URL}/save-test`, {
          code: result.content,
          test_name: testName,
          output_dir: outputDir
        });
        
        const saveResult = saveResponse.data;
        
        if (saveResult.success) {
          console.log(chalk.green(`\n✅ Test saved to: ${saveResult.file_path}`));
        } else {
          console.log(chalk.red(`\n❌ Failed to save test: ${saveResult.error}`));
        }
      } else {
        console.log(chalk.yellow('\n⚠️  Test not saved'));
      }
    } else {
      // Auto-save without approval
      const outputDir = options.output || 'tests';
      const testName = `generated-test-${Date.now()}`;
      
      const saveResponse = await axios.post(`${AI_SERVICE_URL}/save-test`, {
        code: result.content,
        test_name: testName,
        output_dir: outputDir
      });
      
      const saveResult = saveResponse.data;
      
      if (saveResult.success) {
        console.log(chalk.green(`\n✅ Test auto-saved to: ${saveResult.file_path}`));
      } else {
        console.log(chalk.red(`\n❌ Failed to save test: ${saveResult.error}`));
      }
    }
    
    // Display context used (if available)
    if (result.context_used && result.context_used.length > 0) {
      console.log('\n' + chalk.blue.bold('Context Used:'));
      result.context_used.forEach((ctx: any, index: number) => {
        console.log(chalk.gray(`${index + 1}. ${ctx.metadata?.file_path || 'Unknown file'}`));
      });
    }
    
  } catch (error) {
    spinner.fail('Test generation failed');
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.red('\n❌ Cannot connect to AI service.'));
        console.log(chalk.yellow('  → Make sure the AI service is running:'));
        console.log(chalk.gray('    cd ai-automation/ai-service/src'));
        console.log(chalk.gray('    ../venv/bin/uvicorn api_server:app --reload --host 0.0.0.0 --port 8000'));
      } else if (error.response?.status === 503) {
        console.log(chalk.red('\n❌ AI Service not available.'));
        console.log(chalk.yellow('  → Run setup first: ai-test setup'));
      } else {
        console.log(chalk.red(`\n❌ API Error: ${error.response?.data?.detail || error.message}`));
      }
    } else {
      console.log(chalk.red(`\n❌ Unexpected error: ${error}`));
    }
    
    process.exit(1);
  }
} 