/**
 * AI Service Integration for Playwright
 * 
 * This module provides utilities for Playwright tests to interact with the AI service
 * for test generation, analysis, and modification.
 */

import axios, { AxiosResponse } from 'axios';

const AI_SERVICE_URL = process.env['AI_SERVICE_URL'] || 'http://localhost:8000';

export interface AIServiceConfig {
  baseUrl?: string;
  timeout?: number;
}

export interface TestGenerationRequest {
  requirements: string;
  context?: string;
  pageUrl?: string;
  existingTests?: string;
}

export interface TestGenerationResponse {
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

export interface TestAnalysisRequest {
  testCode: string;
  testName?: string;
}

export interface TestAnalysisResponse {
  success: boolean;
  analysis?: {
    quality: string;
    coverage: string;
    suggestions: string[];
    improvements: string[];
  };
  error?: string;
}

export class AIServiceIntegration {
  private baseUrl: string;
  private timeout: number;

  constructor(config: AIServiceConfig = {}) {
    this.baseUrl = config.baseUrl || AI_SERVICE_URL;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Check if the AI service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: this.timeout
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.warn('AI service health check failed:', error);
      return false;
    }
  }

  /**
   * Generate a test based on requirements
   */
  async generateTest(request: TestGenerationRequest): Promise<TestGenerationResponse> {
    try {
      const response: AxiosResponse<TestGenerationResponse> = await axios.post(
        `${this.baseUrl}/generate-test`,
        {
          requirements: request.requirements,
          context_query: request.context
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message
        };
      }
      return {
        success: false,
        error: `Unexpected error: ${error}`
      };
    }
  }

  /**
   * Analyze an existing test
   */
  async analyzeTest(request: TestAnalysisRequest): Promise<TestAnalysisResponse> {
    try {
      const response: AxiosResponse<TestAnalysisResponse> = await axios.post(
        `${this.baseUrl}/analyze-test`,
        {
          code: request.testCode,
          test_name: request.testName
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message
        };
      }
      return {
        success: false,
        error: `Unexpected error: ${error}`
      };
    }
  }

  /**
   * Modify an existing test
   */
  async modifyTest(filePath: string, modificationRequest: string): Promise<TestGenerationResponse> {
    try {
      const response: AxiosResponse<TestGenerationResponse> = await axios.post(
        `${this.baseUrl}/modify-test`,
        {
          file_path: filePath,
          modification_request: modificationRequest
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message
        };
      }
      return {
        success: false,
        error: `Unexpected error: ${error}`
      };
    }
  }

  /**
   * Search for relevant tests in the codebase
   */
  async searchTests(query: string, numResults: number = 10): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/search-tests`,
        {
          query: query,
          n_results: numResults
        },
        { timeout: this.timeout }
      );

      return response.data.results || [];
    } catch (error) {
      console.warn('Test search failed:', error);
      return [];
    }
  }

  /**
   * Save a generated test to file
   */
  async saveTest(code: string, testName: string, outputDir: string = 'tests'): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/save-test`,
        {
          code: code,
          test_name: testName,
          output_dir: outputDir
        },
        { timeout: this.timeout }
      );

      return {
        success: response.data.success,
        filePath: response.data.file_path,
        error: response.data.error
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.detail || error.message
        };
      }
      return {
        success: false,
        error: `Unexpected error: ${error}`
      };
    }
  }
}

// Export a default instance
export const aiService = new AIServiceIntegration();

// Export utility functions for common operations
export async function generateTestForPage(
  pageUrl: string, 
  requirements: string, 
  context?: string
): Promise<TestGenerationResponse> {
  const fullContext = context ? `${context}\nPage URL: ${pageUrl}` : `Page URL: ${pageUrl}`;
  
  return aiService.generateTest({
    requirements,
    context: fullContext,
    pageUrl
  });
}

export async function analyzeCurrentTest(testCode: string): Promise<TestAnalysisResponse> {
  return aiService.analyzeTest({
    testCode,
    testName: 'Current Test'
  });
} 