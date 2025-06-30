#!/usr/bin/env ts-node

/**
 * AI-Powered Test Generation Script
 * 
 * This script demonstrates how to use the AI service to generate Playwright tests
 * based on natural language requirements.
 */

import { enhancedAIService, generateTestForPage } from '../src/enhanced-ai-integration';
import * as fs from 'fs';
import * as path from 'path';

interface GenerateOptions {
  requirements: string;
  pageUrl?: string;
  context?: string;
  outputFile?: string;
  autoSave?: boolean;
  useMock?: boolean;
}

async function generateTest(options: GenerateOptions): Promise<void> {
  console.log('🤖 AI-Powered Test Generation');
  console.log('=' .repeat(50));
  
  // Configure service based on options
  if (options.useMock) {
    enhancedAIService.enableMock();
  }
  
  // Check AI service health
  console.log('Checking AI service health...');
  const isHealthy = await enhancedAIService.checkHealth();
  
  if (!isHealthy) {
    console.log('❌ AI service is not available');
    console.log('  → Try enabling mock service with --use-mock flag');
    process.exit(1);
  }
  
  console.log('✅ AI service is healthy');
  console.log(`🔧 Using: ${enhancedAIService.getCurrentService()} service`);
  
  // Generate test
  console.log('\nGenerating test...');
  console.log(`Requirements: ${options.requirements}`);
  if (options.pageUrl) {
    console.log(`Page URL: ${options.pageUrl}`);
  }
  
  const result = options.pageUrl 
    ? await generateTestForPage(options.pageUrl, options.requirements, options.context)
    : await enhancedAIService.generateTest({
        requirements: options.requirements,
        ...(options.context && { context: options.context })
      });
  
  if (!result.success) {
    console.log(`❌ Test generation failed: ${result.error}`);
    process.exit(1);
  }
  
  console.log('✅ Test generated successfully!');
  
  // Display the generated code
  console.log('\n📝 Generated Test:');
  console.log('-'.repeat(50));
  console.log(result.code);
  
  // Display validation results
  if (result.validation) {
    console.log('\n🔍 Validation:');
    if (result.validation.valid) {
      console.log('✅ Code is valid');
    } else {
      console.log('❌ Code has issues:');
      result.validation.issues.forEach(issue => {
        console.log(`  → ${issue}`);
      });
    }
    
    if (result.validation.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.validation.warnings.forEach(warning => {
        console.log(`  → ${warning}`);
      });
    }
  }
  
  // Save the test if requested
  if (options.autoSave || options.outputFile) {
    const fileName = options.outputFile || `ai-generated-test-${Date.now()}.spec.ts`;
    const outputPath = path.join('tests', fileName);
    
    console.log(`\n💾 Saving test to: ${outputPath}`);
    
    // Ensure tests directory exists
    if (!fs.existsSync('tests')) {
      fs.mkdirSync('tests', { recursive: true });
    }
    
    // Write the test file
    fs.writeFileSync(outputPath, result.code || '');
    console.log('✅ Test saved successfully!');
  }
  
  // Display context used
  if (result.context_used && result.context_used.length > 0) {
    console.log('\n📚 Context Used:');
    result.context_used.forEach((ctx: any, index: number) => {
      console.log(`${index + 1}. ${ctx.metadata?.file_path || 'Unknown file'}`);
    });
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run test:ai-generate -- <requirements> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --url <pageUrl>     Page URL to test');
    console.log('  --context <context> Additional context for generation');
    console.log('  --output <file>     Output file name');
    console.log('  --auto-save         Automatically save the generated test');
    console.log('  --use-mock          Use mock AI service instead of real service');
    console.log('');
    console.log('Examples:');
    console.log('  npm run test:ai-generate -- "test login functionality"');
    console.log('  npm run test:ai-generate -- "test shopping cart" --url "https://example.com" --auto-save');
    console.log('  npm run test:ai-generate -- "test form validation" --use-mock');
    process.exit(1);
  }
  
  const requirements = args[0];
  if (!requirements) {
    console.log('❌ Requirements are required');
    process.exit(1);
  }
  
  const options: GenerateOptions = {
    requirements,
    autoSave: false
  };
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--url':
        if (nextArg && !nextArg.startsWith('--')) {
          options.pageUrl = nextArg;
          i++; // Skip next argument
        }
        break;
      case '--context':
        if (nextArg && !nextArg.startsWith('--')) {
          options.context = nextArg;
          i++; // Skip next argument
        }
        break;
      case '--output':
        if (nextArg && !nextArg.startsWith('--')) {
          options.outputFile = nextArg;
          i++; // Skip next argument
        }
        break;
      case '--auto-save':
        options.autoSave = true;
        break;
      case '--use-mock':
        options.useMock = true;
        break;
    }
  }
  
  await generateTest(options);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
} 