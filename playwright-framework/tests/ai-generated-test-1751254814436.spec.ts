
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