import { test, expect } from '@playwright/test';

test.describe('API Client - HTTP Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should send GET request and display response', async ({ page }) => {
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response status
    await expect(page.locator('text=200')).toBeVisible();
    
    // Check response body contains expected data
    await expect(page.locator('text="userId": 1')).toBeVisible();
    await expect(page.locator('text="id": 1')).toBeVisible();
  });

  test('should send POST request with JSON body', async ({ page }) => {
    // Change method to POST
    await page.locator('select[name="method"]').selectOption('POST');
    
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts');
    
    // Set body type to JSON
    await page.locator('select[name="bodyType"]').selectOption('json');
    
    // Enter JSON body
    await page.locator('textarea[name="body"]').fill('{"title": "Test Post", "body": "Test content", "userId": 1}');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response status
    await expect(page.locator('text=201')).toBeVisible();
    
    // Check response contains the created data
    await expect(page.locator('text="title": "Test Post"')).toBeVisible();
    await expect(page.locator('text="id": 101')).toBeVisible();
  });

  test('should handle custom headers', async ({ page }) => {
    // Add custom header
    await page.locator('button:has-text("Add Header")').click();
    await page.locator('input[placeholder="Header name"]').fill('User-Agent');
    await page.locator('input[placeholder="Header value"]').fill('API-Client-Test');
    
    // Enter URL
    await page.locator('input[name="url"]').fill('https://httpbin.org/headers');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response contains custom header
    await expect(page.locator('text="User-Agent": "API-Client-Test"')).toBeVisible();
  });

  test('should handle PUT request', async ({ page }) => {
    // Change method to PUT
    await page.locator('select[name="method"]').selectOption('PUT');
    
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    
    // Set body type to JSON
    await page.locator('select[name="bodyType"]').selectOption('json');
    
    // Enter JSON body
    await page.locator('textarea[name="body"]').fill('{"id": 1, "title": "Updated Title", "body": "Updated content", "userId": 1}');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response status
    await expect(page.locator('text=200')).toBeVisible();
    
    // Check response contains updated data
    await expect(page.locator('text="title": "Updated Title"')).toBeVisible();
  });

  test('should handle DELETE request', async ({ page }) => {
    // Change method to DELETE
    await page.locator('select[name="method"]').selectOption('DELETE');
    
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response status
    await expect(page.locator('text=200')).toBeVisible();
  });

  test('should handle form data body', async ({ page }) => {
    // Change method to POST
    await page.locator('select[name="method"]').selectOption('POST');
    
    // Enter URL
    await page.locator('input[name="url"]').fill('https://httpbin.org/post');
    
    // Set body type to Form Data
    await page.locator('select[name="bodyType"]').selectOption('form-data');
    
    // Add form data fields
    await page.locator('button:has-text("Add Field")').click();
    await page.locator('input[placeholder="Key"]').first().fill('name');
    await page.locator('input[placeholder="Value"]').first().fill('John Doe');
    
    await page.locator('button:has-text("Add Field")').click();
    await page.locator('input[placeholder="Key"]').nth(1).fill('email');
    await page.locator('input[placeholder="Value"]').nth(1).fill('john@example.com');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check response contains form data
    await expect(page.locator('text="name": "John Doe"')).toBeVisible();
    await expect(page.locator('text="email": "john@example.com"')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Enter invalid URL
    await page.locator('input[name="url"]').fill('https://invalid-url-that-does-not-exist.com/api');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for error
    await expect(page.locator('text=Error:')).toBeVisible();
  });

  test('should save request to history', async ({ page }) => {
    // Enter URL
    await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
    
    // Click send button
    await page.locator('button:has-text("Send")').click();
    
    // Wait for response
    await expect(page.locator('text=Loading...')).not.toBeVisible();
    
    // Check if request appears in history
    await expect(page.locator('text=History')).toBeVisible();
    // Look for the request in the sidebar
    await page.locator('aside').locator('text=Get Posts').first().waitFor({ state: 'visible', timeout: 5000 });
  });
});
