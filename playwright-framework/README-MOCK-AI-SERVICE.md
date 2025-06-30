# Mock AI Service for Development and Testing

This document describes the mock AI service implementation that provides full AI functionality for development and testing purposes.

## 🎯 Overview

The mock AI service is a complete implementation that simulates all AI service functionality, allowing you to:

- **Develop without dependencies** on the real AI service
- **Test AI integration** without external API calls
- **Generate realistic tests** using template-based logic
- **Simulate various scenarios** including errors and delays

## 🚀 Features

### 1. Complete AI Service Simulation
- ✅ **Test Generation**: Generate realistic Playwright tests
- ✅ **Test Analysis**: Analyze test quality and provide suggestions
- ✅ **Test Search**: Search for relevant tests in codebase
- ✅ **Test Modification**: Modify existing tests
- ✅ **Test Saving**: Save generated tests to files
- ✅ **Health Checks**: Simulate service health monitoring

### 2. Smart Test Generation
The mock service uses intelligent templates based on requirements:

- **Login Tests**: Authentication and user management
- **Navigation Tests**: Menu and routing functionality
- **Form Tests**: Form submission and validation
- **Shopping Tests**: E-commerce cart and checkout
- **Default Tests**: General page testing with responsive design

### 3. Realistic Behavior
- **Network Delays**: Simulate real API response times
- **Error Simulation**: Configurable error rates
- **Validation**: Provide realistic validation feedback
- **Context Usage**: Simulate RAG context retrieval

## 📁 Architecture

```
src/
├── mock-ai-service.ts           # Core mock service implementation
├── enhanced-ai-integration.ts   # Service switching logic
└── ai-integration.ts           # Real service integration
```

## 🛠️ Usage

### 1. Basic Mock Service Usage

```typescript
import { MockAIService } from './src/mock-ai-service';

const mockService = new MockAIService({
  responseDelay: 300,        // Simulate 300ms delay
  enableRandomErrors: false,  // Disable random errors
  errorRate: 0.1             // 10% error rate if enabled
});

// Generate a test
const result = await mockService.generateTest({
  requirements: 'test login functionality',
  context: 'User authentication page'
});

console.log(result.code);
```

### 2. Enhanced Service with Auto-Fallback

```typescript
import { EnhancedAIService } from './src/enhanced-ai-integration';

const aiService = new EnhancedAIService({
  useMock: false,              // Start with real service
  autoFallback: true,          // Auto-fallback to mock
  mockConfig: {
    responseDelay: 200,
    enableRandomErrors: false
  }
});

// Automatically falls back to mock if real service fails
const result = await aiService.generateTest({
  requirements: 'test shopping cart'
});
```

### 3. Manual Service Switching

```typescript
// Switch to mock service
enhancedAIService.enableMock();

// Switch back to real service
enhancedAIService.enableReal();

// Check current service
const currentService = enhancedAIService.getCurrentService();
console.log(`Using: ${currentService} service`);
```

## 🧪 Test Generation Examples

### Login Test Template
```typescript
// Requirements: "test login functionality"
import { test, expect } from '@playwright/test';

test('test login functionality', async ({ page }) => {
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
});
```

### Shopping Cart Template
```typescript
// Requirements: "test shopping cart functionality"
import { test, expect } from '@playwright/test';

test('test shopping cart functionality', async ({ page }) => {
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
});
```

## 🔧 Configuration Options

### MockAIServiceConfig
```typescript
interface MockAIServiceConfig {
  responseDelay?: number;      // Simulated network delay (ms)
  enableRandomErrors?: boolean; // Enable random error simulation
  errorRate?: number;          // Error probability (0-1)
}
```

### EnhancedAIServiceConfig
```typescript
interface EnhancedAIServiceConfig {
  useMock?: boolean;           // Start with mock service
  autoFallback?: boolean;      // Auto-fallback on real service failure
  mockConfig?: MockAIServiceConfig;
  realServiceConfig?: {
    baseUrl?: string;
    timeout?: number;
  };
}
```

## 📊 Test Analysis

The mock service provides intelligent test analysis:

```typescript
const analysis = await mockService.analyzeTest({
  testCode: `
    import { test, expect } from '@playwright/test';
    test('example', async ({ page }) => {
      await page.goto('https://example.com');
      await expect(page).toHaveTitle(/Example/);
    });
  `,
  testName: 'Example Test'
});

// Returns:
{
  success: true,
  analysis: {
    quality: 'Excellent',
    coverage: 'High',
    suggestions: [],
    improvements: []
  }
}
```

## 🔍 Test Search

Simulates RAG-based test search:

```typescript
const results = await mockService.searchTests('login authentication', 5);

// Returns mock search results with metadata
[
  {
    metadata: {
      file_path: 'tests/mock-result-1.spec.ts',
      test_name: 'Mock Test 1',
      created_at: '2025-06-30T03:40:28.123Z'
    },
    content: '// Mock test content for: login authentication',
    score: 0.9
  }
]
```

## 💾 Test Saving

Automatically saves generated tests:

```typescript
const saveResult = await mockService.saveTest(
  generatedCode,
  'login-test',
  'tests/generated'
);

// Creates: tests/generated/login-test-1751254814436.spec.ts
```

## 🚨 Error Simulation

Configure realistic error scenarios:

```typescript
const mockService = new MockAIService({
  enableRandomErrors: true,
  errorRate: 0.2  // 20% chance of error
});

// Sometimes returns:
{
  success: false,
  error: 'Mock AI service temporarily unavailable'
}
```

## 🎯 CLI Integration

Use with the test generation CLI:

```bash
# Use mock service explicitly
npm run test:ai-generate -- "test login functionality" --use-mock

# Auto-fallback to mock if real service fails
npm run test:ai-generate -- "test shopping cart" --auto-save
```

## 🔄 Service Switching

The enhanced integration provides seamless switching:

```typescript
// Check service status
const status = await enhancedAIService.getServiceStatus();
console.log(`Current: ${status.currentService}`);
console.log(`Real service: ${status.realServiceHealthy ? '✅' : '❌'}`);
console.log(`Mock service: ${status.mockServiceHealthy ? '✅' : '❌'}`);

// Manual switching
enhancedAIService.enableMock();
enhancedAIService.enableReal();
```

## 📈 Benefits

### 1. Development Benefits
- **No External Dependencies**: Work offline without AI service
- **Fast Iteration**: No network delays during development
- **Predictable Results**: Consistent test generation
- **Easy Testing**: Test AI integration without external APIs

### 2. Testing Benefits
- **Reliable Testing**: No flaky external dependencies
- **Error Simulation**: Test error handling scenarios
- **Performance Testing**: Simulate various response times
- **Edge Case Testing**: Test service switching logic

### 3. Production Benefits
- **Graceful Degradation**: Fallback when AI service is unavailable
- **Reduced Latency**: Use mock for development, real for production
- **Cost Savings**: Reduce AI service calls during development
- **Better UX**: Always provide AI functionality to users

## 🔮 Future Enhancements

### 1. Advanced Templates
- **API Testing**: REST API test templates
- **Performance Testing**: Load testing scenarios
- **Accessibility Testing**: A11y compliance tests
- **Visual Testing**: Screenshot comparison tests

### 2. Smart Context
- **Codebase Analysis**: Simulate real RAG context
- **Test Patterns**: Learn from existing tests
- **Best Practices**: Incorporate testing standards
- **Framework Updates**: Stay current with Playwright features

### 3. Integration Features
- **CI/CD Integration**: Mock service in pipelines
- **Test Reporting**: Enhanced analysis reports
- **Test Maintenance**: Automated test updates
- **Coverage Analysis**: AI-powered coverage optimization

## 📝 Usage Examples

### Environment Configuration
```bash
# Force mock service
export USE_MOCK_AI=true

# Use real service with auto-fallback
export USE_MOCK_AI=false
```

### Package.json Scripts
```json
{
  "scripts": {
    "test:ai-generate": "ts-node scripts/generate-tests.ts",
    "test:ai-mock": "USE_MOCK_AI=true ts-node scripts/generate-tests.ts",
    "test:ai-real": "USE_MOCK_AI=false ts-node scripts/generate-tests.ts"
  }
}
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Use mock AI service for all tests
    env: {
      USE_MOCK_AI: 'true'
    }
  }
});
```

## 🤝 Contributing

When extending the mock service:

1. **Add New Templates**: Create realistic test templates
2. **Enhance Analysis**: Improve test quality assessment
3. **Simulate Real Behavior**: Match real AI service responses
4. **Add Error Scenarios**: Cover more edge cases
5. **Update Documentation**: Keep examples current

## 📊 Performance

### Response Times
- **Mock Service**: ~200-500ms (configurable)
- **Real Service**: ~2-10 seconds (network dependent)
- **Auto-Fallback**: Seamless transition

### Resource Usage
- **Memory**: Minimal (no LLM loading)
- **CPU**: Low (template-based generation)
- **Network**: None (local operation)

## 🎉 Success Metrics

The mock AI service successfully provides:

- ✅ **100% Uptime**: Always available for development
- ✅ **Realistic Output**: High-quality test generation
- ✅ **Seamless Integration**: Works with existing tools
- ✅ **Error Handling**: Robust fallback mechanisms
- ✅ **Performance**: Fast response times
- ✅ **Flexibility**: Configurable behavior

This mock service enables full AI-powered test automation development without external dependencies! 