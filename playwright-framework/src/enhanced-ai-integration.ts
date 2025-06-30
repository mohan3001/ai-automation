/**
 * Enhanced AI Service Integration
 * 
 * This module provides a unified interface that can switch between
 * real AI service and mock service based on configuration.
 */

import { AIServiceIntegration, TestGenerationRequest, TestGenerationResponse, TestAnalysisRequest, TestAnalysisResponse } from './ai-integration';
import { MockAIService, MockAIServiceConfig } from './mock-ai-service';

export interface EnhancedAIServiceConfig {
  useMock?: boolean;
  mockConfig?: MockAIServiceConfig;
  realServiceConfig?: {
    baseUrl?: string;
    timeout?: number;
  };
  autoFallback?: boolean;
}

export class EnhancedAIService {
  private realService: AIServiceIntegration;
  private mockService: MockAIService;
  private useMock: boolean;
  private autoFallback: boolean;

  constructor(config: EnhancedAIServiceConfig = {}) {
    this.useMock = config.useMock ?? false;
    this.autoFallback = config.autoFallback ?? true;
    
    this.realService = new AIServiceIntegration(config.realServiceConfig);
    this.mockService = new MockAIService(config.mockConfig);
  }

  /**
   * Switch to mock service
   */
  enableMock(): void {
    this.useMock = true;
    console.log('🤖 Switched to Mock AI Service');
  }

  /**
   * Switch to real service
   */
  enableReal(): void {
    this.useMock = false;
    console.log('🤖 Switched to Real AI Service');
  }

  /**
   * Check which service is currently active
   */
  getCurrentService(): 'mock' | 'real' {
    return this.useMock ? 'mock' : 'real';
  }

  /**
   * Check health of the appropriate service
   */
  async checkHealth(): Promise<boolean> {
    if (this.useMock) {
      return this.mockService.checkHealth();
    }

    const isHealthy = await this.realService.checkHealth();
    
    // Auto-fallback to mock if real service is unhealthy
    if (!isHealthy && this.autoFallback) {
      console.log('⚠️  Real AI service unhealthy, falling back to mock service');
      this.useMock = true;
      return this.mockService.checkHealth();
    }

    return isHealthy;
  }

  /**
   * Generate test using the appropriate service
   */
  async generateTest(request: TestGenerationRequest): Promise<TestGenerationResponse> {
    if (this.useMock) {
      return this.mockService.generateTest(request);
    }

    try {
      const result = await this.realService.generateTest(request);
      
      // Auto-fallback to mock if real service fails
      if (!result.success && this.autoFallback) {
        console.log('⚠️  Real AI service failed, falling back to mock service');
        this.useMock = true;
        return this.mockService.generateTest(request);
      }

      return result;
    } catch (error) {
      if (this.autoFallback) {
        console.log('⚠️  Real AI service error, falling back to mock service');
        this.useMock = true;
        return this.mockService.generateTest(request);
      }
      throw error;
    }
  }

  /**
   * Analyze test using the appropriate service
   */
  async analyzeTest(request: TestAnalysisRequest): Promise<TestAnalysisResponse> {
    const mockRequest = {
      testCode: request.testCode,
      ...(request.testName && { testName: request.testName })
    };

    if (this.useMock) {
      return this.mockService.analyzeTest(mockRequest);
    }

    try {
      const result = await this.realService.analyzeTest(request);
      
      if (!result.success && this.autoFallback) {
        console.log('⚠️  Real AI service failed, falling back to mock service');
        this.useMock = true;
        return this.mockService.analyzeTest(mockRequest);
      }

      return result;
    } catch (error) {
      if (this.autoFallback) {
        console.log('⚠️  Real AI service error, falling back to mock service');
        this.useMock = true;
        return this.mockService.analyzeTest(mockRequest);
      }
      throw error;
    }
  }

  /**
   * Modify test using the appropriate service
   */
  async modifyTest(filePath: string, modificationRequest: string): Promise<TestGenerationResponse> {
    if (this.useMock) {
      return this.mockService.modifyTest(filePath, modificationRequest);
    }

    try {
      const result = await this.realService.modifyTest(filePath, modificationRequest);
      
      if (!result.success && this.autoFallback) {
        console.log('⚠️  Real AI service failed, falling back to mock service');
        this.useMock = true;
        return this.mockService.modifyTest(filePath, modificationRequest);
      }

      return result;
    } catch (error) {
      if (this.autoFallback) {
        console.log('⚠️  Real AI service error, falling back to mock service');
        this.useMock = true;
        return this.mockService.modifyTest(filePath, modificationRequest);
      }
      throw error;
    }
  }

  /**
   * Search tests using the appropriate service
   */
  async searchTests(query: string, numResults: number = 10): Promise<any[]> {
    if (this.useMock) {
      return this.mockService.searchTests(query, numResults);
    }

    try {
      const results = await this.realService.searchTests(query, numResults);
      
      if (results.length === 0 && this.autoFallback) {
        console.log('⚠️  Real AI service returned no results, falling back to mock service');
        this.useMock = true;
        return this.mockService.searchTests(query, numResults);
      }

      return results;
    } catch (error) {
      if (this.autoFallback) {
        console.log('⚠️  Real AI service error, falling back to mock service');
        this.useMock = true;
        return this.mockService.searchTests(query, numResults);
      }
      throw error;
    }
  }

  /**
   * Save test using the appropriate service
   */
  async saveTest(code: string, testName: string, outputDir: string = 'tests'): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (this.useMock) {
      return this.mockService.saveTest(code, testName, outputDir);
    }

    try {
      const result = await this.realService.saveTest(code, testName, outputDir);
      
      if (!result.success && this.autoFallback) {
        console.log('⚠️  Real AI service failed, falling back to mock service');
        this.useMock = true;
        return this.mockService.saveTest(code, testName, outputDir);
      }

      return result;
    } catch (error) {
      if (this.autoFallback) {
        console.log('⚠️  Real AI service error, falling back to mock service');
        this.useMock = true;
        return this.mockService.saveTest(code, testName, outputDir);
      }
      throw error;
    }
  }

  /**
   * Get service status information
   */
  async getServiceStatus(): Promise<{
    currentService: 'mock' | 'real';
    realServiceHealthy: boolean;
    mockServiceHealthy: boolean;
    autoFallback: boolean;
  }> {
    const realServiceHealthy = await this.realService.checkHealth();
    const mockServiceHealthy = await this.mockService.checkHealth();

    return {
      currentService: this.getCurrentService(),
      realServiceHealthy,
      mockServiceHealthy,
      autoFallback: this.autoFallback
    };
  }
}

// Export a default instance with smart configuration
export const enhancedAIService = new EnhancedAIService({
  useMock: process.env['USE_MOCK_AI'] === 'true',
  autoFallback: true,
  mockConfig: {
    responseDelay: 300,
    enableRandomErrors: false
  }
});

// Export utility functions
export async function generateTestForPage(
  pageUrl: string, 
  requirements: string, 
  context?: string
): Promise<TestGenerationResponse> {
  const fullContext = context ? `${context}\nPage URL: ${pageUrl}` : `Page URL: ${pageUrl}`;
  
  return enhancedAIService.generateTest({
    requirements,
    context: fullContext,
    pageUrl
  });
}

export async function analyzeCurrentTest(testCode: string): Promise<TestAnalysisResponse> {
  return enhancedAIService.analyzeTest({
    testCode,
    testName: 'Current Test'
  });
}

// Export the enhanced service as the main AI service
export { enhancedAIService as aiService }; 