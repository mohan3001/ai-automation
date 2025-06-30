# AI-Powered Playwright Test Automation

This document describes the AI integration features added to the Playwright framework for intelligent test generation and analysis.

## 🚀 Features

### 1. AI Service Integration
- **Health Monitoring**: Check AI service availability before running tests
- **Test Generation**: Generate Playwright tests from natural language requirements
- **Test Analysis**: Analyze existing tests for quality and improvements
- **Test Search**: Search for relevant tests in the codebase
- **Test Modification**: Modify existing tests based on requirements

### 2. CLI Tools
- **Test Generation**: `npm run test:ai-generate -- "requirements"`
- **Test Analysis**: `npm run test:ai-analyze -- "test-file.spec.ts"`

### 3. In-Test AI Integration
- Generate tests dynamically based on page content
- Analyze test quality during execution
- Search for relevant test patterns

## 📁 Project Structure

```
playwright-framework/
├── src/
│   └── ai-integration.ts          # AI service integration module
├── scripts/
│   ├── generate-tests.ts          # CLI test generation script
│   └── analyze-tests.ts           # CLI test analysis script
├── tests/
│   ├── ai-integration-example.spec.ts  # Example AI integration tests
│   └── example.spec.ts            # Standard Playwright tests
└── package.json                   # Enhanced with AI dependencies
```

## 🛠️ Setup

### Prerequisites
1. **AI Service Running**: Ensure the AI service is running on `http://localhost:8000`
2. **Ollama**: Make sure Ollama is running with the `mistral` model
3. **Dependencies**: Install the enhanced dependencies

### Installation
```bash
# Install dependencies (includes axios, ts-node, typescript)
npm install

# Verify AI service health
curl http://localhost:8000/health
```

## 📖 Usage Examples

### 1. Generate Tests via CLI

```bash
# Basic test generation
npm run test:ai-generate -- "test login functionality"

# Generate test for specific URL
npm run test:ai-generate -- "test shopping cart" --url "https://example.com"

# Generate with context and auto-save
npm run test:ai-generate -- "test form validation" --url "https://example.com" --context "Form has email and password fields" --auto-save
```

### 2. Use AI Integration in Tests

```typescript
import { test, expect } from '@playwright/test';
import { aiService, generateTestForPage } from '../src/ai-integration';

test('AI-powered test generation', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  
  // Generate test based on current page
  const result = await generateTestForPage(
    page.url(),
    'test that the page loads correctly and has navigation',
    `Page title: ${await page.title()}`
  );
  
  if (result.success && result.code) {
    console.log('Generated test:', result.code);
  }
});
```

### 3. Analyze Existing Tests

```typescript
const analysis = await aiService.analyzeTest({
  testCode: `
    import { test, expect } from '@playwright/test';
    test('example', async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/Example/);
    });
  `,
  testName: 'Example Test'
});

if (analysis.success && analysis.analysis) {
  console.log('Quality:', analysis.analysis.quality);
  console.log('Coverage:', analysis.analysis.coverage);
  console.log('Suggestions:', analysis.analysis.suggestions);
}
```

## 🔧 Configuration

### Environment Variables
```bash
AI_SERVICE_URL=http://localhost:8000  # AI service endpoint
```

### AI Service Configuration
```typescript
import { AIServiceIntegration } from '../src/ai-integration';

const aiService = new AIServiceIntegration({
  baseUrl: 'http://localhost:8000',
  timeout: 30000
});
```

## 🧪 Running Tests

### Standard Playwright Tests
```bash
npm test                           # Run all tests
npm run test:headed               # Run in headed mode
npm run test:ui                   # Run with UI
```

### AI Integration Tests
```bash
# Run AI integration examples
npm test -- tests/ai-integration-example.spec.ts

# Run specific AI test
npm test -- tests/ai-integration-example.spec.ts -g "should demonstrate AI-powered test generation"
```

## 🔍 API Reference

### AIServiceIntegration Class

#### Methods
- `checkHealth()`: Check if AI service is available
- `generateTest(request)`: Generate test from requirements
- `analyzeTest(request)`: Analyze existing test code
- `modifyTest(filePath, request)`: Modify existing test
- `searchTests(query, numResults)`: Search for relevant tests
- `saveTest(code, testName, outputDir)`: Save generated test

#### Interfaces
```typescript
interface TestGenerationRequest {
  requirements: string;
  context?: string;
  pageUrl?: string;
  existingTests?: string;
}

interface TestGenerationResponse {
  success: boolean;
  code?: string;
  error?: string;
  validation?: {
    valid: boolean;
    issues: string[];
    warnings: string[];
  };
  context_used?: any[];
}
```

## 🚨 Troubleshooting

### AI Service Not Available
```bash
# Check if AI service is running
curl http://localhost:8000/health

# Start AI service if needed
cd ../ai-service/src
../venv/bin/uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

### Ollama Not Running
```bash
# Check Ollama status
ollama list

# Start Ollama if needed
ollama serve

# Pull required model
ollama pull mistral
```

### Import Errors
If you see Python import errors in the AI service:
1. Check Python version (should be 3.10 or 3.11)
2. Verify all dependencies are installed
3. Check relative import structure

## 🎯 Next Steps

### Phase C: Advanced Integration
- **Test Execution Workflows**: Automated test generation and execution
- **Approval Workflows**: Human-in-the-loop test approval
- **Continuous Integration**: CI/CD pipeline integration
- **Performance Testing**: AI-powered performance test generation

### Phase D: Production Features
- **Test Maintenance**: Automated test updates
- **Coverage Analysis**: AI-powered coverage optimization
- **Flaky Test Detection**: Intelligent flaky test identification
- **Test Data Generation**: AI-generated test data

## 📊 Current Status

- ✅ **Phase A**: CLI Tool + AI Service Integration
- ✅ **Phase B**: Playwright-to-AI Service Integration
- 🔄 **Phase C**: Advanced Workflows (Next)
- ⏳ **Phase D**: Production Features

## 🤝 Contributing

1. Follow the existing code structure
2. Add TypeScript types for all new features
3. Include error handling for AI service failures
4. Add tests for new functionality
5. Update this documentation

## 📝 License

This project is part of the AI Test Automation Framework. 