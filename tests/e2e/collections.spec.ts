import { test, expect } from '@playwright/test';

test.describe('API Client - Collections Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to collections page', async ({ page }) => {
    await page.locator('nav a[href="/collections"]').click();
    await expect(page).toHaveURL(/\/collections/);
    await expect(page.locator('h1')).toContainText('Collections');
  });

  test('should create a new collection', async ({ page }) => {
    await page.goto('/collections');
    
    // Click create collection button
    await page.locator('button:has-text("New Collection")').click();
    
    // Fill collection details
    await page.locator('input[name="name"]').fill('Test Collection');
    await page.locator('textarea[name="description"]').fill('A test collection for E2E testing');
    
    // Save collection
    await page.locator('button:has-text("Create")').click();
    
    // Verify collection appears in list
    await expect(page.locator('text=Test Collection')).toBeVisible();
    await expect(page.locator('text=A test collection for E2E testing')).toBeVisible();
  });

  test('should edit an existing collection', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a collection first
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Collection to Edit');
    await page.locator('textarea[name="description"]').fill('Original description');
    await page.locator('button:has-text("Create")').click();
    
    // Edit the collection
    await page.locator('button:has-text("Edit")').first().click();
    await page.locator('input[name="name"]').fill('Edited Collection');
    await page.locator('textarea[name="description"]').fill('Updated description');
    await page.locator('button:has-text("Save")').click();
    
    // Verify changes
    await expect(page.locator('text=Edited Collection')).toBeVisible();
    await expect(page.locator('text=Updated description')).toBeVisible();
  });

  test('should delete a collection', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a collection first
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Collection to Delete');
    await page.locator('button:has-text("Create")').click();
    
    // Delete the collection
    await page.locator('button:has-text("Delete")').first().click();
    
    // Confirm deletion in dialog
    await page.locator('button:has-text("Delete")').nth(1).click();
    
    // Verify collection is gone
    await expect(page.locator('text=Collection to Delete')).not.toBeVisible();
  });

  test('should add requests to collection', async ({ page }) => {
    await page.goto('/');
    
    // Create a request first
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts');
    await page.locator('button:has-text("Send")').click();
    await expect(page.locator('text=200')).toBeVisible();
    
    // Save the request
    await page.locator('button:has-text("Save")').click();
    await page.locator('input[name="requestName"]').fill('Test Request');
    await page.locator('button:has-text("Save Request")').click();
    
    // Go to collections
    await page.locator('nav a[href="/collections"]').click();
    
    // Create a collection
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Collection with Requests');
    await page.locator('button:has-text("Create")').click();
    
    // Add request to collection
    await page.locator('button:has-text("Add Request")').click();
    await page.locator('select[name="request"]').selectOption({ label: 'Test Request' });
    await page.locator('button:has-text("Add")').click();
    
    // Verify request is in collection
    await expect(page.locator('text=Test Request')).toBeVisible();
  });

  test('should export collections', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a collection
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Export Test Collection');
    await page.locator('textarea[name="description"]').fill('Collection for export testing');
    await page.locator('button:has-text("Create")').click();
    
    // Export collection
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.json$/);
  });

  test('should import collections', async ({ page }) => {
    await page.goto('/collections');
    
    // Create test collection data
    const collectionData = {
      name: 'Imported Collection',
      description: 'Collection imported from JSON',
      requests: [
        {
          name: 'Imported Request',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts',
          headers: {},
          body: null,
          bodyType: 'none'
        }
      ]
    };
    
    // Import collection
    await page.locator('button:has-text("Import")').click();
    
    // Create a temporary file for import
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test-collection.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(collectionData, null, 2))
    });
    
    await page.locator('button:has-text("Import")').nth(1).click();
    
    // Verify imported collection
    await expect(page.locator('text=Imported Collection')).toBeVisible();
    await expect(page.locator('text=Imported Request')).toBeVisible();
  });

  test('should search collections', async ({ page }) => {
    await page.goto('/collections');
    
    // Create multiple collections
    const collections = [
      { name: 'API Tests', description: 'Test API endpoints' },
      { name: 'User Management', description: 'User related APIs' },
      { name: 'Data Processing', description: 'Data processing endpoints' }
    ];
    
    for (const collection of collections) {
      await page.locator('button:has-text("New Collection")').click();
      await page.locator('input[name="name"]').fill(collection.name);
      await page.locator('textarea[name="description"]').fill(collection.description);
      await page.locator('button:has-text("Create")').click();
    }
    
    // Search for specific collection
    await page.locator('input[placeholder="Search collections..."]').fill('API');
    
    // Verify search results
    await expect(page.locator('text=API Tests')).toBeVisible();
    await expect(page.locator('text=User Management')).not.toBeVisible();
    await expect(page.locator('text=Data Processing')).not.toBeVisible();
  });
});
