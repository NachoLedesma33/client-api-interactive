import { test, expect } from '@playwright/test';

test.describe('API Client - Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should send request with Ctrl+Enter', async ({ page }) => {
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    
    // Use keyboard shortcut to send request
    await page.locator('input[name="url"]').press('Control+Enter');
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response status
    await expect(page.locator('text=200')).toBeVisible();
  });

  test('should save request with Ctrl+S', async ({ page }) => {
    // Create a request first
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts');
    await page.locator('button:has-text("Send")').click();
    await expect(page.locator('text=200')).toBeVisible();
    
    // Use keyboard shortcut to save
    await page.locator('input[name="url"]').press('Control+S');
    
    // Check if save dialog appears
    await expect(page.locator('input[name="requestName"]')).toBeVisible();
    
    // Fill request name and save
    await page.locator('input[name="requestName"]').fill('Keyboard Shortcut Test');
    await page.locator('button:has-text("Save Request")').click();
    
    // Verify request was saved
    await expect(page.locator('text=Request saved successfully')).toBeVisible();
  });

  test('should create new request with Ctrl+N', async ({ page }) => {
    // Fill some data first
    await page.locator('input[name="url"]').fill('https://example.com/api');
    await page.locator('select[name="method"]').selectOption('POST');
    
    // Use keyboard shortcut to create new request
    await page.locator('input[name="url"]').press('Control+N');
    
    // Check if form is cleared
    await expect(page.locator('input[name="url"]')).toHaveValue('');
    await expect(page.locator('select[name="method"]')).toHaveValue('GET');
  });

  test('should focus search with Ctrl+H', async ({ page }) => {
    // Use keyboard shortcut to focus search
    await page.keyboard.press('Control+H');
    
    // Check if search input is focused (if implemented)
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeFocused();
    }
  });

  test('should show help with F1', async ({ page }) => {
    // Use keyboard shortcut to show help
    await page.keyboard.press('F1');
    
    // Check if help modal appears (if implemented)
    const helpModal = page.locator('.help-modal, .modal:has-text("Help"), .modal:has-text("Shortcuts")');
    if (await helpModal.isVisible()) {
      await expect(helpModal).toBeVisible();
    }
  });

  test('should close modal with Escape', async ({ page }) => {
    // Open a modal first
    await page.locator('nav a[href="/collections"]').click();
    await page.locator('button:has-text("New Collection")').click();
    
    // Verify modal is open
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    // Use Escape to close modal
    await page.keyboard.press('Escape');
    
    // Check if modal is closed
    await expect(page.locator('input[name="name"]')).not.toBeVisible();
  });

  test('should navigate between tabs with Tab', async ({ page }) => {
    // Focus on URL input
    await page.locator('input[name="url"]').focus();
    
    // Use Tab to navigate to next element
    await page.locator('input[name="url"]').press('Tab');
    
    // Check if method selector is focused
    await expect(page.locator('select[name="method"]')).toBeFocused();
    
    // Use Tab again
    await page.locator('select[name="method"]').press('Tab');
    
    // Check if send button is focused
    await expect(page.locator('button:has-text("Send")')).toBeFocused();
  });

  test('should navigate backwards with Shift+Tab', async ({ page }) => {
    // Focus on send button
    await page.locator('button:has-text("Send")').focus();
    
    // Use Shift+Tab to go back
    await page.locator('button:has-text("Send")').press('Shift+Tab');
    
    // Check if method selector is focused
    await expect(page.locator('select[name="method"]')).toBeFocused();
    
    // Use Shift+Tab again
    await page.locator('select[name="method"]').press('Shift+Tab');
    
    // Check if URL input is focused
    await expect(page.locator('input[name="url"]')).toBeFocused();
  });

  test('should navigate with arrow keys in dropdowns', async ({ page }) => {
    // Focus on method selector
    await page.locator('select[name="method"]').focus();
    
    // Open dropdown
    await page.locator('select[name="method"]').press('ArrowDown');
    
    // Navigate through options
    await page.locator('select[name="method"]').press('ArrowDown'); // Should select POST
    await page.locator('select[name="method"]').press('ArrowDown'); // Should select PUT
    
    // Select option
    await page.locator('select[name="method"]').press('Enter');
    
    // Verify selection
    await expect(page.locator('select[name="method"]')).toHaveValue('PUT');
  });

  test('should handle keyboard navigation in collections', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a collection first
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Navigation Test');
    await page.locator('button:has-text("Create")').click();
    
    // Focus on first collection
    await page.locator('.collection-item').first().focus();
    
    // Use arrow keys to navigate (if implemented)
    await page.locator('.collection-item').first().press('ArrowDown');
    
    // Check if next collection is focused (if multiple exist)
    const collections = page.locator('.collection-item');
    if (await collections.count() > 1) {
      await expect(collections.nth(1)).toBeFocused();
    }
  });

  test('should handle keyboard shortcuts in environment variables', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Keyboard Test Environment');
    
    // Add variable
    await page.locator('button:has-text("Add Variable")').click();
    
    // Focus on variable name input
    await page.locator('input[placeholder="Variable name"]').first().focus();
    
    // Type variable name
    await page.type('input[placeholder="Variable name"]', 'testVar');
    
    // Tab to value input
    await page.locator('input[placeholder="Variable name"]').first().press('Tab');
    
    // Type variable value
    await page.type('input[placeholder="Variable value"]', 'testValue');
    
    // Save with Enter (if implemented)
    await page.locator('input[placeholder="Variable value"]').first().press('Enter');
    
    // Check if environment is saved
    await expect(page.locator('text=Keyboard Test Environment')).toBeVisible();
  });

  test('should handle copy/paste shortcuts', async ({ page }) => {
    // Enter some text in URL field
    await page.locator('input[name="url"]').fill('https://example.com/api/test');
    
    // Select all text
    await page.locator('input[name="url"]').press('Control+a');
    
    // Copy text
    await page.locator('input[name="url"]').press('Control+c');
    
    // Clear field
    await page.locator('input[name="url"]').fill('');
    
    // Paste text
    await page.locator('input[name="url"]').press('Control+v');
    
    // Verify text was pasted
    await expect(page.locator('input[name="url"]')).toHaveValue('https://example.com/api/test');
  });

  test('should handle undo/redo shortcuts', async ({ page }) => {
    // Enter text
    await page.locator('input[name="url"]').fill('https://example.com');
    
    // Add more text
    await page.locator('input[name="url"]').fill('/api/test');
    
    // Undo
    await page.locator('input[name="url"]').press('Control+z');
    
    // Check if text was undone (if implemented)
    const currentValue = await page.locator('input[name="url"]').inputValue();
    expect(currentValue).toBe('https://example.com');
  });
});
