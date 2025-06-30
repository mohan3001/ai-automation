#!/usr/bin/env node

/**
 * Test Lister for Playwright Framework
 * 
 * This script scans the tests directory and provides a comprehensive
 * overview of all available tests in the Playwright automation framework.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TESTS_DIR = path.join(__dirname, 'tests');
const GENERATED_TESTS_DIR = path.join(TESTS_DIR, 'generated');
const EXAMPLES_DIR = path.join(__dirname, 'tests-examples');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function extractTestInfo(content, filePath) {
  const tests = [];
  const lines = content.split('\n');
  let currentTest = null;
  let inTestBlock = false;
  let describeBlock = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for describe blocks
    if (line.startsWith('test.describe(') || line.startsWith('describe(')) {
      describeBlock = line.match(/['"`]([^'"`]+)['"`]/)?.[1] || 'Unknown Suite';
    }
    
    // Check for test definitions
    if (line.startsWith('test(') || line.startsWith('it(')) {
      const testName = line.match(/['"`]([^'"`]+)['"`]/)?.[1] || 'Unnamed Test';
      currentTest = {
        name: testName,
        describe: describeBlock,
        line: i + 1,
        file: path.basename(filePath)
      };
      inTestBlock = true;
    }
    
    // Check for test.beforeEach, test.afterEach, etc.
    if (line.startsWith('test.beforeEach(') || line.startsWith('test.afterEach(') || 
        line.startsWith('test.beforeAll(') || line.startsWith('test.afterAll(')) {
      const hookName = line.match(/test\.(\w+)\(/)?.[1] || 'Unknown Hook';
      tests.push({
        name: `${hookName} hook`,
        describe: describeBlock,
        line: i + 1,
        file: path.basename(filePath),
        type: 'hook'
      });
    }
    
    // End of test block
    if (inTestBlock && line === '});') {
      if (currentTest) {
        tests.push(currentTest);
        currentTest = null;
      }
      inTestBlock = false;
    }
  }
  
  return tests;
}

function scanDirectory(dirPath, category) {
  const tests = [];
  
  if (!fs.existsSync(dirPath)) {
    return tests;
  }
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      tests.push(...scanDirectory(filePath, `${category}/${file}`));
    } else if (file.endsWith('.spec.ts') || file.endsWith('.spec.js')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileTests = extractTestInfo(content, filePath);
        
        fileTests.forEach(test => {
          test.category = category;
          test.fullPath = filePath;
        });
        
        tests.push(...fileTests);
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
      }
    }
  }
  
  return tests;
}

function categorizeTests(tests) {
  const categories = {
    'AI Integration': [],
    'Generated': [],
    'Examples': [],
    'Standard': []
  };
  
  tests.forEach(test => {
    if (test.category.includes('generated')) {
      categories['Generated'].push(test);
    } else if (test.category.includes('examples')) {
      categories['Examples'].push(test);
    } else if (test.file.includes('ai-integration') || test.file.includes('ai-generated')) {
      categories['AI Integration'].push(test);
    } else {
      categories['Standard'].push(test);
    }
  });
  
  return categories;
}

function printTestSummary(tests) {
  console.log(colorize('\n📊 TEST SUMMARY', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  const categories = categorizeTests(tests);
  
  Object.entries(categories).forEach(([category, categoryTests]) => {
    if (categoryTests.length > 0) {
      console.log(colorize(`\n${category} Tests:`, 'yellow'));
      console.log(colorize(`  Total: ${categoryTests.length}`, 'green'));
      
      // Group by file
      const byFile = {};
      categoryTests.forEach(test => {
        if (!byFile[test.file]) {
          byFile[test.file] = [];
        }
        byFile[test.file].push(test);
      });
      
      Object.entries(byFile).forEach(([file, fileTests]) => {
        console.log(colorize(`    📁 ${file}:`, 'blue'));
        fileTests.forEach(test => {
          const typeIcon = test.type === 'hook' ? '🔧' : '🧪';
          console.log(colorize(`      ${typeIcon} ${test.name}`, 'white'));
          if (test.describe && test.describe !== 'Unknown Suite') {
            console.log(colorize(`        └─ Suite: ${test.describe}`, 'gray'));
          }
        });
      });
    }
  });
}

function printDetailedList(tests) {
  console.log(colorize('\n📋 DETAILED TEST LIST', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  const categories = categorizeTests(tests);
  
  Object.entries(categories).forEach(([category, categoryTests]) => {
    if (categoryTests.length > 0) {
      console.log(colorize(`\n${category.toUpperCase()} TESTS`, 'yellow'));
      console.log(colorize('-'.repeat(30), 'cyan'));
      
      categoryTests.forEach((test, index) => {
        console.log(colorize(`${index + 1}. ${test.name}`, 'green'));
        console.log(colorize(`   File: ${test.file}`, 'blue'));
        console.log(colorize(`   Line: ${test.line}`, 'magenta'));
        if (test.describe && test.describe !== 'Unknown Suite') {
          console.log(colorize(`   Suite: ${test.describe}`, 'cyan'));
        }
        console.log(colorize(`   Type: ${test.type || 'test'}`, 'yellow'));
        console.log('');
      });
    }
  });
}

function printTestCoverage(tests) {
  console.log(colorize('\n🎯 TEST COVERAGE ANALYSIS', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  const categories = categorizeTests(tests);
  const totalTests = tests.length;
  const totalHooks = tests.filter(t => t.type === 'hook').length;
  const totalActualTests = totalTests - totalHooks;
  
  console.log(colorize(`Total Test Files: ${new Set(tests.map(t => t.file)).size}`, 'green'));
  console.log(colorize(`Total Test Cases: ${totalActualTests}`, 'green'));
  console.log(colorize(`Total Hooks: ${totalHooks}`, 'blue'));
  console.log(colorize(`Total Items: ${totalTests}`, 'yellow'));
  
  console.log(colorize('\nBreakdown by Category:', 'yellow'));
  Object.entries(categories).forEach(([category, categoryTests]) => {
    if (categoryTests.length > 0) {
      const percentage = ((categoryTests.length / totalTests) * 100).toFixed(1);
      console.log(colorize(`  ${category}: ${categoryTests.length} (${percentage}%)`, 'cyan'));
    }
  });
  
  // Suggest missing test types
  console.log(colorize('\n💡 SUGGESTIONS FOR IMPROVEMENT:', 'yellow'));
  const suggestions = [];
  
  if (categories['Standard'].length === 0) {
    suggestions.push('Add more standard Playwright tests for basic functionality');
  }
  
  if (categories['AI Integration'].length === 0) {
    suggestions.push('Consider adding AI-powered test generation examples');
  }
  
  if (totalHooks === 0) {
    suggestions.push('Add beforeEach/afterEach hooks for better test setup/cleanup');
  }
  
  if (suggestions.length === 0) {
    console.log(colorize('  ✅ Good test coverage! Consider adding:', 'green'));
    console.log(colorize('    - Performance tests', 'cyan'));
    console.log(colorize('    - Accessibility tests', 'cyan'));
    console.log(colorize('    - Visual regression tests', 'cyan'));
  } else {
    suggestions.forEach(suggestion => {
      console.log(colorize(`  - ${suggestion}`, 'cyan'));
    });
  }
}

function printUsageInstructions() {
  console.log(colorize('\n🚀 HOW TO RUN THESE TESTS', 'bright'));
  console.log(colorize('='.repeat(50), 'cyan'));
  
  console.log(colorize('\nStandard Playwright Commands:', 'yellow'));
  console.log(colorize('  npm test', 'green'));
  console.log(colorize('  npm run test:headed', 'green'));
  console.log(colorize('  npm run test:ui', 'green'));
  
  console.log(colorize('\nRun Specific Test Categories:', 'yellow'));
  console.log(colorize('  # Run only AI integration tests', 'cyan'));
  console.log(colorize('  npm test -- tests/ai-integration-example.spec.ts', 'green'));
  
  console.log(colorize('  # Run only generated tests', 'cyan'));
  console.log(colorize('  npm test -- tests/generated/', 'green'));
  
  console.log(colorize('  # Run specific test by name', 'cyan'));
  console.log(colorize('  npm test -- -g "test name"', 'green'));
  
  console.log(colorize('\nAI Service Integration:', 'yellow'));
  console.log(colorize('  # Check AI service health', 'cyan'));
  console.log(colorize('  curl http://localhost:8000/health', 'green'));
  
  console.log(colorize('  # Generate new tests', 'cyan'));
  console.log(colorize('  curl -X POST http://localhost:8000/generate-test \\', 'green'));
  console.log(colorize('    -H "Content-Type: application/json" \\', 'green'));
  console.log(colorize('    -d \'{"requirements": "your test requirements"}\'', 'green'));
}

// Main execution
function main() {
  console.log(colorize('🧪 PLAYWRIGHT TEST FRAMEWORK - TEST LISTER', 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
  
  // Scan all test directories
  const allTests = [
    ...scanDirectory(TESTS_DIR, 'tests'),
    ...scanDirectory(EXAMPLES_DIR, 'examples')
  ];
  
  if (allTests.length === 0) {
    console.log(colorize('❌ No tests found!', 'red'));
    console.log(colorize('Make sure you have test files in the tests/ directory.', 'yellow'));
    return;
  }
  
  // Print results
  printTestSummary(allTests);
  printDetailedList(allTests);
  printTestCoverage(allTests);
  printUsageInstructions();
  
  console.log(colorize('\n✨ Test listing complete!', 'green'));
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, extractTestInfo, categorizeTests }; 