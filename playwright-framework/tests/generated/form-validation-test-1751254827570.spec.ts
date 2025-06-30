
import { test, expect } from '@playwright/test';

test('test form submission with validation', async ({ page }) => {
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
});