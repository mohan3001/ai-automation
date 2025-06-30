# Prompt Template: List All Available Tests

## Basic Prompt
```
Analyze and list all available Playwright tests in my automation framework. Provide a comprehensive overview including:

1. Test file locations and names
2. Individual test case names and descriptions
3. Test suites and their organization
4. Categorization by type (unit, integration, AI-generated, etc.)
5. Test coverage analysis
6. Suggestions for improvement

Please scan the tests directory and provide detailed information about each test.
```

## Detailed Analysis Prompt
```
Create a comprehensive analysis of my Playwright test automation framework. Please:

1. **Scan and List All Tests:**
   - Find all .spec.ts and .spec.js files in the tests/ directory
   - Extract test names, descriptions, and file locations
   - Identify test suites and their structure

2. **Categorize Tests:**
   - AI Integration tests (tests using AI service)
   - Generated tests (AI-generated test files)
   - Standard tests (manual test cases)
   - Example tests (demo and tutorial tests)
   - Hook functions (beforeEach, afterEach, etc.)

3. **Provide Statistics:**
   - Total number of test files
   - Total number of test cases
   - Breakdown by category
   - Test coverage percentage

4. **Analyze Test Quality:**
   - Identify well-structured tests
   - Find potential improvements
   - Suggest missing test scenarios
   - Recommend best practices

5. **Generate Usage Instructions:**
   - How to run specific test categories
   - Commands for running individual tests
   - AI service integration examples

Please provide this information in a well-organized, easy-to-read format.
```

## AI Service API Prompt
```
Use the AI service to analyze my Playwright test framework. Send the following request:

POST /generate-test
{
  "requirements": "Create a comprehensive analysis and listing of all available Playwright tests in the automation framework. Include test names, descriptions, file locations, and categorize them by type (unit tests, integration tests, AI-generated tests, etc.). Provide a summary of test coverage and suggest any missing test scenarios.",
  "context_query": "List all test files and their contents in the playwright-framework/tests directory"
}
```

## Quick Status Check Prompt
```
Provide a quick overview of my Playwright test framework:

1. How many test files do I have?
2. What are the main test categories?
3. Which tests are AI-generated vs manually written?
4. What's the overall test coverage?
5. Any immediate suggestions for improvement?

Please be concise but informative.
```

## Test Generation Prompt
```
Based on my current test suite, suggest additional tests that would improve coverage:

1. Analyze existing tests for gaps
2. Suggest missing test scenarios
3. Recommend performance tests
4. Propose accessibility tests
5. Suggest visual regression tests

Please provide specific test requirements that can be used with the AI service to generate new tests.
```

## Usage Examples

### Using the CLI Tool
```bash
# Run the test lister script
node list-tests.js

# Use the CLI tool to analyze tests
npm run analyze -- --list-tests
```

### Using the AI Service Directly
```bash
# Check AI service health
curl http://localhost:8000/health

# Get comprehensive test analysis
curl -X POST http://localhost:8000/generate-test \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Analyze and list all available Playwright tests in my automation framework",
    "context_query": "List all test files and their contents in the playwright-framework/tests directory"
  }'
```

### Using the Enhanced AI Integration
```typescript
import { enhancedAIService } from '../src/enhanced-ai-integration';

// Get test analysis
const analysis = await enhancedAIService.generateTest({
  requirements: "List and analyze all available tests in the framework",
  context: "Provide comprehensive overview of test coverage and organization"
});
```

## Expected Output Format

The analysis should include:

1. **Summary Section**
   - Total test files and cases
   - Breakdown by category
   - Overall coverage metrics

2. **Detailed Test List**
   - File-by-file breakdown
   - Individual test descriptions
   - Test suite organization

3. **Coverage Analysis**
   - What's well covered
   - What's missing
   - Improvement suggestions

4. **Usage Instructions**
   - How to run tests
   - How to generate new tests
   - AI service integration

This prompt template can be used with any of the available tools to get a comprehensive overview of your Playwright test automation framework. 