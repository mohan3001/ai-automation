/**
 * Mock AI Service for Development and Testing
 * 
 * This module provides a complete mock implementation of the AI service
 * that simulates all AI functionality for development and testing purposes.
 * It generates realistic Playwright tests and provides intelligent analysis.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MockAIServiceConfig {
  responseDelay?: number;
  enableRandomErrors?: boolean;
  errorRate?: number;
}

export class MockAIService {
  private responseDelay: number;
  private enableRandomErrors: boolean;
  private errorRate: number;

  constructor(config: MockAIServiceConfig = {}) {
    this.responseDelay = config.responseDelay || 500;
    this.enableRandomErrors = config.enableRandomErrors || false;
    this.errorRate = config.errorRate || 0.1;
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));
  }

  /**
   * Simulate random errors
   */
  private shouldSimulateError(): boolean {
    if (!this.enableRandomErrors) return false;
    return Math.random() < this.errorRate;
  }

  /**
   * Generate a realistic Playwright test
   */
  private generatePlaywrightTest(requirements: string, context?: string): string {
    const testTemplates = {
      'login': `
import { test, expect } from '@playwright/test';

test('${requirements.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()}', async ({ page }) => {
  // Navigate to the login page
  await page.goto('https://example.com/login');
  
  // Fill in login credentials
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  
  // Submit the form
  await page.click('[data-testid="login-button"]');
  
  // Verify successful login
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // Additional verification
  await expect(page.locator('text=Welcome')).toBeVisible();
});`,

      'navigation': `
import { test, expect } from '@playwright/test';

test('${requirements.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()}', async ({ page }) => {
  // Navigate to the main page
  await page.goto('https://example.com');
  
  // Verify page loads correctly
  await expect(page).toHaveTitle(/Example/);
  await expect(page.locator('nav')).toBeVisible();
  
  // Test navigation links
  const navLinks = page.locator('nav a');
  await expect(navLinks).toHaveCount(5);
  
  // Click on a navigation link
  await page.click('nav a[href="/about"]');
  await expect(page).toHaveURL(/.*about/);
  
  // Verify page content
  await expect(page.locator('h1')).toContainText('About');
});`,

      'form': `
import { test, expect } from '@playwright/test';

test('${requirements.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()}', async ({ page }) => {
  // Navigate to the form page
  await page.goto('https://example.com/contact');
  
  // Fill out the form
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="email"]', 'john@example.com');
  await page.fill('[name="message"]', 'This is a test message');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.success-message')).toContainText('Thank you');
});`,

      'shopping': `
import { test, expect } from '@playwright/test';

test('${requirements.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()}', async ({ page }) => {
  // Navigate to the store
  await page.goto('https://example.com/store');
  
  // Browse products
  await expect(page.locator('.product-card')).toHaveCount(10);
  
  // Add item to cart
  await page.click('.product-card:first-child .add-to-cart');
  await expect(page.locator('.cart-count')).toHaveText('1');
  
  // Go to cart
  await page.click('.cart-icon');
  await expect(page).toHaveURL(/.*cart/);
  
  // Verify cart contents
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('.cart-total')).toBeVisible();
});`,

      'default': `
import { test, expect } from '@playwright/test';

test('${requirements.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()}', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://example.com');
  
  // Verify page loads
  await expect(page).toHaveTitle(/Example/);
  await expect(page.locator('body')).toBeVisible();
  
  // Test basic functionality
  await expect(page.locator('main')).toBeVisible();
  
  // Additional context: ${context || 'No additional context provided'}
  
  // Verify page is responsive
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('nav')).toBeVisible();
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.mobile-menu')).toBeVisible();
});`
    };

    // Determine which template to use based on requirements
    let template = 'default';
    const reqLower = requirements.toLowerCase();
    
    if (reqLower.includes('login') || reqLower.includes('auth')) {
      template = 'login';
    } else if (reqLower.includes('nav') || reqLower.includes('menu')) {
      template = 'navigation';
    } else if (reqLower.includes('form') || reqLower.includes('submit')) {
      template = 'form';
    } else if (reqLower.includes('shop') || reqLower.includes('cart') || reqLower.includes('store')) {
      template = 'shopping';
    }

    return testTemplates[template as keyof typeof testTemplates];
  }

  /**
   * Analyze test code and provide feedback
   */
  private analyzeTestCode(testCode: string): any {
    const analysis = {
      quality: 'Good',
      coverage: 'Medium',
      suggestions: [] as string[],
      improvements: [] as string[]
    };

    // Analyze test structure
    if (!testCode.includes('import { test, expect }')) {
      analysis.suggestions.push('Add proper Playwright imports');
    }

    if (!testCode.includes('page.goto')) {
      analysis.suggestions.push('Consider adding page navigation');
    }

    if (!testCode.includes('expect(')) {
      analysis.suggestions.push('Add assertions to verify expected behavior');
    }

    if (testCode.includes('await page.click') && !testCode.includes('expect')) {
      analysis.improvements.push('Add assertions after click actions');
    }

    if (testCode.includes('page.fill') && !testCode.includes('expect')) {
      analysis.improvements.push('Verify form submissions with assertions');
    }

    // Determine quality based on analysis
    const score = 100 - (analysis.suggestions.length * 10) - (analysis.improvements.length * 5);
    if (score >= 80) {
      analysis.quality = 'Excellent';
      analysis.coverage = 'High';
    } else if (score >= 60) {
      analysis.quality = 'Good';
      analysis.coverage = 'Medium';
    } else {
      analysis.quality = 'Needs Improvement';
      analysis.coverage = 'Low';
    }

    return analysis;
  }

  /**
   * Mock health check
   */
  async checkHealth(): Promise<boolean> {
    await this.simulateDelay();
    return !this.shouldSimulateError();
  }

  /**
   * Mock test generation
   */
  async generateTest(request: { requirements: string; context?: string; pageUrl?: string; existingTests?: string }): Promise<any> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      return {
        success: false,
        error: 'Mock AI service temporarily unavailable'
      };
    }

    const generatedCode = this.generatePlaywrightTest(request.requirements, request.context);
    
    return {
      success: true,
      code: generatedCode,
      validation: {
        valid: true,
        issues: [],
        warnings: ['Generated by mock AI service for development']
      },
      context_used: [
        {
          metadata: { file_path: 'mock-context.ts' },
          content: 'Mock context for development'
        }
      ]
    };
  }

  /**
   * Mock test analysis
   */
  async analyzeTest(request: { testCode: string; testName?: string }): Promise<any> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      return {
        success: false,
        error: 'Mock analysis service temporarily unavailable'
      };
    }

    const analysis = this.analyzeTestCode(request.testCode);
    
    return {
      success: true,
      analysis: analysis
    };
  }

  /**
   * Mock test modification
   */
  async modifyTest(filePath: string, modificationRequest: string): Promise<any> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      return {
        success: false,
        error: 'Mock modification service temporarily unavailable'
      };
    }

    // Generate a modified version of the test
    const modifiedCode = this.generatePlaywrightTest(modificationRequest);
    
    return {
      success: true,
      code: `// Modified test based on: ${modificationRequest}\n${modifiedCode}`,
      validation: {
        valid: true,
        issues: [],
        warnings: ['Modified by mock AI service']
      }
    };
  }

  /**
   * Mock test search
   */
  async searchTests(query: string, numResults: number = 10): Promise<any[]> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      return [];
    }

    // Generate mock search results
    const mockResults = [];
    for (let i = 0; i < Math.min(numResults, 5); i++) {
      mockResults.push({
        metadata: {
          file_path: `tests/mock-result-${i + 1}.spec.ts`,
          test_name: `Mock Test ${i + 1}`,
          created_at: new Date().toISOString()
        },
        content: `// Mock test content for: ${query}\n// This is a generated search result for development purposes`,
        score: 0.9 - (i * 0.1)
      });
    }

    return mockResults;
  }

  /**
   * Mock test saving
   */
  async saveTest(code: string, testName: string, outputDir: string = 'tests'): Promise<any> {
    await this.simulateDelay();
    
    if (this.shouldSimulateError()) {
      return {
        success: false,
        error: 'Mock save service temporarily unavailable'
      };
    }

    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `${testName.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.spec.ts`;
      const filePath = path.join(outputDir, fileName);

      // Write the test file
      fs.writeFileSync(filePath, code);

      return {
        success: true,
        file_path: filePath,
        message: 'Test saved successfully by mock service'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save test: ${error}`
      };
    }
  }
}

// Export a default instance
export const mockAIService = new MockAIService();

// Export utility functions
export function createMockAIService(config: MockAIServiceConfig = {}): MockAIService {
  return new MockAIService(config);
} 