import { test, expect } from '@playwright/test';

test.describe('API Client - Import/Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should export a single request', async ({ page }) => {
    // Create a request first
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    await page.locator('button:has-text("Send")').click();
    await expect(page.locator('text=200')).toBeVisible();
    
    // Save the request
    await page.locator('button:has-text("Save")').click();
    await page.locator('input[name="requestName"]').fill('Export Test Request');
    await page.locator('button:has-text("Save Request")').click();
    
    // Export the request (look for export button in sidebar or request menu)
    const exportButton = page.locator('button:has-text("Export"), .export-request').first();
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/.*\.json$/);
    }
  });

  test('should import a request from JSON', async ({ page }) => {
    // Create test request data
    const requestData = {
      name: 'Imported Request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Client-Test'
      },
      body: null,
      bodyType: 'none'
    };
    
    // Look for import functionality
    const importButton = page.locator('button:has-text("Import"), .import-request').first();
    if (await importButton.isVisible()) {
      await importButton.click();
      
      // Upload the file
      await page.locator('input[type="file"]').setInputFiles({
        name: 'test-request.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(requestData, null, 2))
      });
      
      await page.locator('button:has-text("Import")').click();
      
      // Verify imported request
      await expect(page.locator('text=Imported Request')).toBeVisible();
    }
  });

  test('should export collections with requests', async ({ page }) => {
    await page.goto('/collections');
    
    // Create a collection with requests
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Export Collection');
    await page.locator('textarea[name="description"]').fill('Collection for export testing');
    await page.locator('button:has-text("Create")').click();
    
    // Export collection
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.json$/);
    
    // Verify downloaded content structure
    const content = await download.createReadStream();
    let textContent = '';
    for await (const chunk of content) {
      textContent += chunk.toString();
    }
    const exportedData = JSON.parse(textContent);
    
    expect(exportedData).toHaveProperty('name', 'Export Collection');
    expect(exportedData).toHaveProperty('description', 'Collection for export testing');
  });

  test('should import collections with multiple requests', async ({ page }) => {
    await page.goto('/collections');
    
    // Create comprehensive collection data
    const collectionData = {
      name: 'Complete API Collection',
      description: 'A complete collection with multiple requests',
      requests: [
        {
          name: 'Get Users',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/users',
          headers: {},
          body: null,
          bodyType: 'none'
        },
        {
          name: 'Create User',
          method: 'POST',
          url: 'https://jsonplaceholder.typicode.com/users',
          headers: { 'Content-Type': 'application/json' },
          body: { name: 'John Doe', email: 'john@example.com' },
          bodyType: 'json'
        },
        {
          name: 'Update User',
          method: 'PUT',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          headers: { 'Content-Type': 'application/json' },
          body: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
          bodyType: 'json'
        },
        {
          name: 'Delete User',
          method: 'DELETE',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          headers: {},
          body: null,
          bodyType: 'none'
        }
      ]
    };
    
    // Import collection
    await page.locator('button:has-text("Import")').click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'complete-collection.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(collectionData, null, 2))
    });
    await page.locator('button:has-text("Import")').click();
    
    // Verify imported collection and requests
    await expect(page.locator('text=Complete API Collection')).toBeVisible();
    await expect(page.locator('text=Get Users')).toBeVisible();
    await expect(page.locator('text=Create User')).toBeVisible();
    await expect(page.locator('text=Update User')).toBeVisible();
    await expect(page.locator('text=Delete User')).toBeVisible();
  });

  test('should export environments', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment with variables
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Production Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').first().fill('apiUrl');
    await page.locator('input[placeholder="Variable value"]').first().fill('https://api.example.com');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').nth(1).fill('apiKey');
    await page.locator('input[placeholder="Variable value"]').nth(1).fill('prod-api-key-123');
    await page.locator('button:has-text("Create")').click();
    
    // Export environment
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.json$/);
    
    // Verify content
    const content = await download.createReadStream();
    let textContent = '';
    for await (const chunk of content) {
      textContent += chunk.toString();
    }
    const exportedData = JSON.parse(textContent);
    
    expect(exportedData).toHaveProperty('name', 'Production Environment');
    expect(exportedData).toHaveProperty('variables');
    expect(exportedData.variables).toHaveProperty('apiUrl', 'https://api.example.com');
    expect(exportedData.variables).toHaveProperty('apiKey', 'prod-api-key-123');
  });

  test('should import environments with complex variables', async ({ page }) => {
    await page.goto('/environments');
    
    // Create complex environment data
    const environmentData = {
      name: 'Development Environment',
      variables: {
        baseUrl: 'https://dev-api.example.com',
        version: 'v2',
        timeout: '10000',
        auth: {
          type: 'Bearer',
          token: 'dev-token-456'
        },
        endpoints: {
          users: '/users',
          posts: '/posts',
          comments: '/comments'
        }
      }
    };
    
    // Import environment
    await page.locator('button:has-text("Import")').click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'dev-environment.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(environmentData, null, 2))
    });
    await page.locator('button:has-text("Import")').click();
    
    // Verify imported environment
    await expect(page.locator('text=Development Environment')).toBeVisible();
    await expect(page.locator('text=baseUrl')).toBeVisible();
    await expect(page.locator('text=version')).toBeVisible();
  });

  test('should handle cURL import', async ({ page }) => {
    // Look for cURL import functionality
    const curlButton = page.locator('button:has-text("cURL"), .import-curl').first();
    if (await curlButton.isVisible()) {
      await curlButton.click();
      
      // Enter cURL command
      const curlCommand = `curl -X POST https://jsonplaceholder.typicode.com/posts \\
        -H "Content-Type: application/json" \\
        -d '{"title": "Test", "body": "Test body", "userId": 1}'`;
      
      await page.locator('textarea[placeholder*="cURL"]').fill(curlCommand);
      await page.locator('button:has-text("Import")').click();
      
      // Verify request was imported
      await expect(page.locator('input[name="url"]')).toHaveValue('https://jsonplaceholder.typicode.com/posts');
      await expect(page.locator('select[name="method"]')).toHaveValue('POST');
    }
  });

  test('should export entire workspace', async ({ page }) => {
    // Look for workspace export functionality
    const exportWorkspaceButton = page.locator('button:has-text("Export Workspace"), .export-all').first();
    if (await exportWorkspaceButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportWorkspaceButton.click();
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/.*\.json$/);
      
      // Verify content structure
      const content = await download.createReadStream();
      let textContent = '';
      for await (const chunk of content) {
        textContent += chunk.toString();
      }
      const workspaceData = JSON.parse(textContent);
      
      expect(workspaceData).toHaveProperty('collections');
      expect(workspaceData).toHaveProperty('environments');
      expect(workspaceData).toHaveProperty('requests');
    }
  });

  test('should handle invalid import formats gracefully', async ({ page }) => {
    await page.goto('/collections');
    
    // Try to import invalid JSON
    await page.locator('button:has-text("Import")').click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('invalid json content')
    });
    await page.locator('button:has-text("Import")').click();
    
    // Should show error message
    await expect(page.locator('text=Error, Invalid JSON, Failed to import').first()).toBeVisible();
  });

  test('should handle large exports/imports', async ({ page }) => {
    await page.goto('/collections');
    
    // Create large collection data
    const largeCollection = {
      name: 'Large Collection',
      description: 'Collection with many requests',
      requests: Array.from({ length: 50 }, (_, i) => ({
        name: `Request ${i + 1}`,
        method: 'GET',
        url: `https://api.example.com/endpoint/${i + 1}`,
        headers: { 'Content-Type': 'application/json' },
        body: null,
        bodyType: 'none'
      }))
    };
    
    // Import large collection
    await page.locator('button:has-text("Import")').click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'large-collection.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(largeCollection, null, 2))
    });
    await page.locator('button:has-text("Import")').click();
    
    // Verify import completed
    await expect(page.locator('text=Large Collection')).toBeVisible();
  });

  test('should maintain data integrity during export/import cycle', async ({ page }) => {
    await page.goto('/collections');
    
    // Create original collection
    await page.locator('button:has-text("New Collection")').click();
    await page.locator('input[name="name"]').fill('Integrity Test');
    await page.locator('textarea[name="description"]').fill('Testing data integrity');
    await page.locator('button:has-text("Create")').click();
    
    // Export collection
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;
    
    // Delete original collection
    await page.locator('button:has-text("Delete")').click();
    await page.locator('button:has-text("Delete")').nth(1).click();
    
    // Import the same collection
    await page.locator('button:has-text("Import")').click();
    const downloadPath = await download.path();
    await page.locator('input[type="file"]').setInputFiles(downloadPath);
    await page.locator('button:has-text("Import")').click();
    
    // Verify data integrity
    await expect(page.locator('text=Integrity Test')).toBeVisible();
    await expect(page.locator('text=Testing data integrity')).toBeVisible();
  });
});
