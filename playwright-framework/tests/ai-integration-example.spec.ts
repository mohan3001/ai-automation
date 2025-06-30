import { test, expect } from '@playwright/test';
import { enhancedAIService, generateTestForPage } from '../src/enhanced-ai-integration';

/**
 * Example test demonstrating AI integration with Playwright
 * 
 * This test shows how to:
 * 1. Check AI service health before running tests
 * 2. Generate tests dynamically based on page content
 * 3. Use AI analysis for test improvement
 * 4. Switch between real and mock AI services
 */

test.describe('AI Integration Examples', () => {
  
  test.beforeAll(async () => {
    // Check if AI service is available
    const isHealthy = await enhancedAIService.checkHealth();
    if (!isHealthy) {
      console.log('⚠️  AI service not available - some features will be limited');
    }
    
    // Show current service status
    const status = await enhancedAIService.getServiceStatus();
    console.log(`🔧 AI Service Status: ${status.currentService} service active`);
    console.log(`   Real service: ${status.realServiceHealthy ? '✅' : '❌'}`);
    console.log(`   Mock service: ${status.mockServiceHealthy ? '✅' : '❌'}`);
  });

  test('should demonstrate AI-powered test generation', async ({ page }) => {
    // Navigate to a page
    await page.goto('https://playwright.dev/');
    
    // Get page title for context
    const title = await page.title();
    
    // Example: Generate a test for the current page
    const result = await generateTestForPage(
      page.url(),
      'test that the page loads correctly and has navigation',
      `Page title: ${title}`
    );
    
    if (result.success && result.code) {
      console.log('🤖 AI Generated Test:');
      console.log(result.code);
      
      // You could save this test or use it for analysis
      if (result.validation) {
        console.log('Validation:', result.validation.valid ? '✅ Valid' : '❌ Invalid');
      }
    } else {
      console.log('AI test generation failed:', result.error);
    }
    
    // Continue with the actual test
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should analyze existing test code', async () => {
    // Example test code to analyze
    const testCode = `
      import { test, expect } from '@playwright/test';
      
      test('example test', async ({ page }) => {
        await page.goto('https://example.com');
        await expect(page).toHaveTitle(/Example/);
      });
    `;
    
    const analysis = await enhancedAIService.analyzeTest({
      testCode,
      testName: 'Example Test Analysis'
    });
    
    if (analysis.success && analysis.analysis) {
      console.log('📊 Test Analysis:');
      console.log(`Quality: ${analysis.analysis.quality}`);
      console.log(`Coverage: ${analysis.analysis.coverage}`);
      
      if (analysis.analysis.suggestions.length > 0) {
        console.log('💡 Suggestions:');
        analysis.analysis.suggestions.forEach(suggestion => {
          console.log(`  → ${suggestion}`);
        });
      }
    }
  });

  test('should search for relevant tests', async () => {
    // Search for tests related to login functionality
    const searchResults = await enhancedAIService.searchTests('login authentication', 5);
    
    if (searchResults.length > 0) {
      console.log('🔍 Found relevant tests:');
      searchResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.metadata?.file_path || 'Unknown'}`);
        console.log(`   Content: ${result.content?.substring(0, 100)}...`);
      });
    } else {
      console.log('No relevant tests found');
    }
  });

  test('should demonstrate dynamic test generation based on page content', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    
    // Get page content for context
    const heading = await page.locator('h1').first().textContent();
    const links = await page.locator('a').count();
    
    const context = `
      Page has heading: ${heading}
      Number of links: ${links}
      Current URL: ${page.url()}
    `;
    
    // Generate a test based on the actual page content
    const result = await enhancedAIService.generateTest({
      requirements: 'test that the page has proper navigation and content structure',
      context: context,
      pageUrl: page.url()
    });
    
    if (result.success) {
      console.log('🎯 Dynamic Test Generated:');
      console.log(result.code);
      
      // You could execute this generated test or save it
      console.log('💡 This test could be saved and executed later');
    }
  });

  test('should demonstrate service switching', async () => {
    // Show current service
    const currentService = enhancedAIService.getCurrentService();
    console.log(`🔧 Current service: ${currentService}`);
    
    // Switch to mock service for demonstration
    enhancedAIService.enableMock();
    console.log(`🔧 Switched to: ${enhancedAIService.getCurrentService()} service`);
    
    // Generate a test with mock service
    const result = await enhancedAIService.generateTest({
      requirements: 'test login functionality with mock service'
    });
    
    if (result.success) {
      console.log('🤖 Mock Service Generated Test:');
      console.log(result.code);
    }
    
    // Switch back to real service (if available)
    enhancedAIService.enableReal();
    console.log(`🔧 Switched back to: ${enhancedAIService.getCurrentService()} service`);
  });
});

/**
 * Example of how to use AI integration in a real test scenario
 */
test.describe('Real-world AI Integration', () => {
  
  test('should use AI to improve test coverage', async ({ page }) => {
    // Navigate to a complex page
    await page.goto('https://playwright.dev/');
    
    // Get page structure for AI analysis
    const pageInfo = {
      title: await page.title(),
      headings: await page.locator('h1, h2, h3').count(),
      links: await page.locator('a').count(),
      buttons: await page.locator('button').count(),
      forms: await page.locator('form').count()
    };
    
    // Ask AI to suggest additional test scenarios
    const result = await enhancedAIService.generateTest({
      requirements: `suggest additional test scenarios for a page with ${pageInfo.headings} headings, ${pageInfo.links} links, ${pageInfo.buttons} buttons, and ${pageInfo.forms} forms`,
      context: `Page title: ${pageInfo.title}, URL: ${page.url()}`
    });
    
    if (result.success && result.code) {
      console.log('🧠 AI Suggested Test Scenarios:');
      console.log(result.code);
      
      // You could parse this and create actual test cases
      console.log('💡 These scenarios could be converted to actual Playwright tests');
    }
  });

  test('should demonstrate test saving functionality', async () => {
    // Generate a test
    const result = await enhancedAIService.generateTest({
      requirements: 'test form submission with validation'
    });
    
    if (result.success && result.code) {
      // Save the generated test
      const saveResult = await enhancedAIService.saveTest(
        result.code,
        'form-validation-test',
        'tests/generated'
      );
      
      if (saveResult.success) {
        console.log('💾 Test saved successfully:');
        console.log(`   File: ${saveResult.filePath}`);
      } else {
        console.log('❌ Failed to save test:', saveResult.error);
      }
    }
  });
}); 