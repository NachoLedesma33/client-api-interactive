import { test, expect } from '@playwright/test';

test.describe('API Client - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/API Client/);
    await expect(page.locator('nav a[href="/"]')).toContainText('API Client');
  });

  test('should display navigation links', async ({ page }) => {
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/collections"]')).toBeVisible();
    await expect(page.locator('nav a[href="/environments"]')).toBeVisible();
    await expect(page.locator('nav a[href="/settings"]')).toBeVisible();
  });

  test('should show request editor components', async ({ page }) => {
    // Check for method selector
    await expect(page.locator('select[name="method"]')).toBeVisible();
    
    // Check for URL input
    await expect(page.locator('input[name="url"]')).toBeVisible();
    
    // Check for send button
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
    
    // Check for headers section
    await expect(page.locator('text=Headers')).toBeVisible();
    
    // Check for body section
    await expect(page.locator('text=Body')).toBeVisible();
  });

  test('should show response panel', async ({ page }) => {
    await expect(page.locator('text=Enter a URL and click Send')).toBeVisible();
  });

  test('should show sidebar with collections', async ({ page }) => {
    // Sidebar should be visible on desktop
    await expect(page.locator('aside')).toBeVisible();
    
    // Should have collections section
    await expect(page.locator('text=Collections')).toBeVisible();
    
    // Should have history section
    await expect(page.locator('text=History')).toBeVisible();
  });
});
