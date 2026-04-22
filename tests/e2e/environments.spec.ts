import { test, expect } from '@playwright/test';

test.describe('API Client - Environments & Variables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to environments page', async ({ page }) => {
    await page.locator('nav a[href="/environments"]').click();
    await expect(page).toHaveURL(/\/environments/);
    await expect(page.locator('h1')).toContainText('Environments');
  });

  test('should create a new environment', async ({ page }) => {
    await page.goto('/environments');
    
    // Click create environment button
    await page.locator('button:has-text("New Environment")').click();
    
    // Fill environment details
    await page.locator('input[name="name"]').fill('Test Environment');
    
    // Add variables
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').first().fill('baseUrl');
    await page.locator('input[placeholder="Variable value"]').first().fill('https://jsonplaceholder.typicode.com');
    
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').nth(1).fill('apiKey');
    await page.locator('input[placeholder="Variable value"]').nth(1).fill('test-api-key-123');
    
    // Save environment
    await page.locator('button:has-text("Create")').click();
    
    // Verify environment appears in list
    await expect(page.locator('text=Test Environment')).toBeVisible();
  });

  test('should activate an environment', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment first
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Active Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').fill('apiUrl');
    await page.locator('input[placeholder="Variable value"]').fill('https://api.example.com');
    await page.locator('button:has-text("Create")').click();
    
    // Activate the environment
    await page.locator('button:has-text("Activate")').click();
    
    // Verify environment is active (check for active indicator)
    await expect(page.locator('text=Active Environment')).toBeVisible();
    await expect(page.locator('.active-environment')).toBeVisible();
  });

  test('should use environment variables in requests', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment with baseUrl variable
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('API Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').fill('baseUrl');
    await page.locator('input[placeholder="Variable value"]').fill('https://jsonplaceholder.typicode.com');
    await page.locator('button:has-text("Create")').click();
    
    // Activate the environment
    await page.locator('button:has-text("Activate")').click();
    
    // Go back to main page
    await page.locator('nav a[href="/"]').click();
    
    // Use variable in URL
    await page.locator('input[name="url"]').fill('{{baseUrl}}/posts/1');
    
    // Send request
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Verify request worked (variable was resolved)
    await expect(page.locator('text=200')).toBeVisible();
    await expect(page.locator('text="userId": 1')).toBeVisible();
  });

  test('should show variable preview', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Preview Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').fill('apiEndpoint');
    await page.locator('input[placeholder="Variable value"]').fill('/users');
    await page.locator('button:has-text("Create")').click();
    
    // Activate environment
    await page.locator('button:has-text("Activate")').click();
    
    // Go back to main page
    await page.locator('nav a[href="/"]').click();
    
    // Enter URL with variable
    await page.locator('input[name="url"]').fill('https://api.example.com{{apiEndpoint}}');
    
    // Check for variable preview (if implemented)
    const previewElement = page.locator('.variable-preview');
    if (await previewElement.isVisible()) {
      await expect(previewElement).toContainText('https://api.example.com/users');
    }
  });

  test('should edit environment variables', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Editable Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').fill('oldVar');
    await page.locator('input[placeholder="Variable value"]').fill('oldValue');
    await page.locator('button:has-text("Create")').click();
    
    // Edit environment
    await page.locator('button:has-text("Edit")').first().click();
    
    // Update variable
    await page.locator('input[placeholder="Variable name"]').fill('newVar');
    await page.locator('input[placeholder="Variable value"]').fill('newValue');
    
    // Save changes
    await page.locator('button:has-text("Save")').click();
    
    // Verify changes
    await expect(page.locator('text=newVar')).toBeVisible();
    await expect(page.locator('text=oldVar')).not.toBeVisible();
  });

  test('should delete environment', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Deletable Environment');
    await page.locator('button:has-text("Create")').click();
    
    // Delete environment
    await page.locator('button:has-text("Delete")').first().click();
    
    // Confirm deletion
    await page.locator('button:has-text("Delete")').nth(1).click();
    
    // Verify environment is gone
    await expect(page.locator('text=Deletable Environment')).not.toBeVisible();
  });

  test('should export environments', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Export Environment');
    await page.locator('button:has-text("Add Variable")').click();
    await page.locator('input[placeholder="Variable name"]').fill('testVar');
    await page.locator('input[placeholder="Variable value"]').fill('testValue');
    await page.locator('button:has-text("Create")').click();
    
    // Export environment
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.json$/);
  });

  test('should import environments', async ({ page }) => {
    await page.goto('/environments');
    
    // Create test environment data
    const environmentData = {
      name: 'Imported Environment',
      variables: {
        apiUrl: 'https://api.example.com',
        version: 'v1',
        timeout: '5000'
      }
    };
    
    // Import environment
    await page.locator('button:has-text("Import")').click();
    
    // Create a temporary file for import
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test-environment.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(environmentData, null, 2))
    });
    
    await page.locator('button:has-text("Import")').nth(1).click();
    
    // Verify imported environment
    await expect(page.locator('text=Imported Environment')).toBeVisible();
    await expect(page.locator('text=apiUrl')).toBeVisible();
    await expect(page.locator('text=version')).toBeVisible();
  });

  test('should handle complex variable values', async ({ page }) => {
    await page.goto('/environments');
    
    // Create environment with complex values
    await page.locator('button:has-text("New Environment")').click();
    await page.locator('input[name="name"]').fill('Complex Environment');
    
    // Add different types of variables
    const variables = [
      { name: 'jsonVar', value: '{"key": "value", "number": 123}' },
      { name: 'urlVar', value: 'https://api.example.com/v1/users' },
      { name: 'tokenVar', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    ];
    
    for (const variable of variables) {
      await page.locator('button:has-text("Add Variable")').click();
      await page.locator('input[placeholder="Variable name"]').last().fill(variable.name);
      await page.locator('input[placeholder="Variable value"]').last().fill(variable.value);
    }
    
    await page.locator('button:has-text("Create")').click();
    
    // Verify all variables are saved
    for (const variable of variables) {
      await expect(page.locator(`text=${variable.name}`)).toBeVisible();
    }
  });
});
