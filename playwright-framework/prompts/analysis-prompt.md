# Analysis-Focused Prompt Templates

## Prompt for Existing Test Analysis (Not Generation)

Use these prompts when you want to **analyze and list existing tests** rather than generate new ones:

### **Option 1: Pure Analysis Prompt**
```
ANALYZE ONLY - DO NOT GENERATE NEW TESTS

Please analyze the existing test files in my Playwright framework and provide:

1. **File Inventory:**
   - List all .spec.ts and .spec.js files found
   - Count total test files and test cases
   - Identify file locations and paths

2. **Test Categorization:**
   - AI Integration tests (files containing AI service usage)
   - Generated tests (files with timestamps in names)
   - Standard tests (basic Playwright examples)
   - Example tests (demo and tutorial files)
   - Hook functions (beforeEach, afterEach, etc.)

3. **Test Details:**
   - Extract test names and descriptions
   - Identify test suites and their structure
   - List hook functions and their purposes

4. **Coverage Analysis:**
   - What functionality is being tested
   - What areas might be missing
   - Suggestions for improvement

5. **Usage Information:**
   - How to run specific test categories
   - Commands for individual test execution

DO NOT generate any new test code. Focus only on analyzing existing tests.
```

### **Option 2: Quick Status Prompt**
```
QUICK STATUS CHECK - NO NEW TESTS

Provide a brief overview of my existing Playwright test framework:

1. How many test files exist?
2. What are the main categories of tests?
3. Which tests are AI-generated vs manually written?
4. What's the approximate test coverage?
5. Any obvious gaps or improvements needed?

Focus on existing tests only - do not create new test code.
```

### **Option 3: Detailed Inventory Prompt**
```
DETAILED INVENTORY - EXISTING TESTS ONLY

Create a comprehensive inventory of my existing Playwright test files:

**Required Analysis:**
- Scan and list every .spec.ts and .spec.js file
- Extract all test function names and descriptions
- Identify test suites and their organization
- Count total tests, hooks, and describe blocks
- Categorize by type (AI, Generated, Standard, Example)
- Provide file-by-file breakdown

**Do NOT:**
- Generate new test code
- Suggest new test scenarios
- Create example implementations

Focus purely on documenting what already exists.
```

## Usage Examples

### **Using curl with Analysis Prompt**
```bash
# Check AI service health first
curl http://localhost:8000/health

# Use the pure analysis prompt
curl -X POST "http://localhost:8000/generate-test" \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "ANALYZE ONLY - DO NOT GENERATE NEW TESTS. Please analyze the existing test files in my Playwright framework and provide: 1. File Inventory - List all .spec.ts and .spec.js files found, Count total test files and test cases, Identify file locations and paths. 2. Test Categorization - AI Integration tests, Generated tests, Standard tests, Example tests, Hook functions. 3. Test Details - Extract test names and descriptions, Identify test suites and their structure, List hook functions and their purposes. 4. Coverage Analysis - What functionality is being tested, What areas might be missing, Suggestions for improvement. 5. Usage Information - How to run specific test categories, Commands for individual test execution. DO NOT generate any new test code. Focus only on analyzing existing tests.",
    "context_query": "Analyze existing test files in playwright-framework/tests directory"
  }'
```

### **Using Enhanced AI Integration**
```typescript
import { enhancedAIService } from '../src/enhanced-ai-integration';

// Use analysis-focused prompt
const analysis = await enhancedAIService.generateTest({
  requirements: "ANALYZE ONLY - DO NOT GENERATE NEW TESTS. Please analyze the existing test files in my Playwright framework and provide a comprehensive inventory of all test files, test names, categories, and coverage analysis. Focus only on documenting what already exists.",
  context: "Analyze existing test files in playwright-framework/tests directory"
});
```

## Expected Output Format

The analysis should return:

1. **Summary Statistics**
   - Total test files: X
   - Total test cases: Y
   - Total hooks: Z

2. **File-by-File Breakdown**
   - `filename.spec.ts`: X tests, Y hooks, Category: Z

3. **Test Categories**
   - AI Integration: X files, Y tests
   - Generated: X files, Y tests
   - Standard: X files, Y tests
   - Examples: X files, Y tests

4. **Coverage Analysis**
   - Well-covered areas
   - Missing functionality
   - Improvement suggestions

5. **Usage Commands**
   - How to run specific categories
   - Individual test execution

## Troubleshooting

If the AI service generates new tests instead of analyzing:

1. **Use stronger language**: Start with "ANALYZE ONLY - DO NOT GENERATE"
2. **Be specific**: Mention "existing tests" multiple times
3. **Use the context_query**: Focus on "Analyze existing test files"
4. **Try different prompts**: Use the quick status or detailed inventory prompts

These prompts are specifically designed to get analysis rather than generation responses. 