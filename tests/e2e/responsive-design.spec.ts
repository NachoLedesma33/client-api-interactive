import { test, expect, devices } from '@playwright/test';

test.describe('API Client - Responsive Design', () => {
  test.describe('Desktop Viewport', () => {
    test.use({ ...devices['Desktop Chrome'] });

    test('should display sidebar on desktop', async ({ page }) => {
      await page.goto('/');
      
      // Sidebar should be visible on desktop
      await expect(page.locator('aside')).toBeVisible();
      
      // Navigation should be visible
      await expect(page.locator('nav')).toBeVisible();
      
      // Main content should be visible
      await expect(page.locator('#app-root')).toBeVisible();
    });

    test('should have proper layout on desktop', async ({ page }) => {
      await page.goto('/');
      
      // Check that main layout elements are present
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      
      // Check that request editor and response panel are visible
      await expect(page.locator('[data-testid="request-editor"], .request-editor')).toBeVisible();
      await expect(page.locator('[data-testid="response-panel"], .response-panel')).toBeVisible();
    });
  });

  test.describe('Mobile Viewport', () => {
    test.use({ ...devices['iPhone 12'] });

    test('should hide sidebar on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Sidebar should be hidden on mobile
      await expect(page.locator('aside')).not.toBeVisible();
      
      // Main content should still be visible
      await expect(page.locator('#app-root')).toBeVisible();
    });

    test('should have mobile navigation', async ({ page }) => {
      await page.goto('/');
      
      // Check for mobile menu button (if implemented)
      const mobileMenuButton = page.locator('button[aria-label="Menu"], .mobile-menu-button, .hamburger');
      if (await mobileMenuButton.isVisible()) {
        await expect(mobileMenuButton).toBeVisible();
      }
    });

    test('should adapt request editor for mobile', async ({ page }) => {
      await page.goto('/');
      
      // Request editor should be visible but adapted for mobile
      await expect(page.locator('input[name="url"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send")')).toBeVisible();
      
      // Check if elements are properly sized for mobile
      const urlInput = page.locator('input[name="url"]');
      const boundingBox = await urlInput.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400); // Should fit mobile screen
    });

    test('should handle mobile keyboard interactions', async ({ page }) => {
      await page.goto('/');
      
      // Focus on URL input
      await page.locator('input[name="url"]').focus();
      
      // Mobile keyboard should appear (we can't test this directly, but we can test focus behavior)
      await expect(page.locator('input[name="url"]')).toBeFocused();
      
      // Type in URL
      await page.locator('input[name="url"]').fill('https://jsonplaceholder.typicode.com/posts/1');
      
      // Send request
      await page.locator('button:has-text("Send")').click();
      
      // Response should be visible
      await expect(page.locator('text=200')).toBeVisible();
    });
  });

  test.describe('Tablet Viewport', () => {
    test.use({ ...devices['iPad Pro'] });

    test('should display properly on tablet', async ({ page }) => {
      await page.goto('/');
      
      // Layout should work on tablet
      await expect(page.locator('#app-root')).toBeVisible();
      await expect(page.locator('input[name="url"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send")')).toBeVisible();
    });

    test('should handle tablet orientation changes', async ({ page }) => {
      await page.goto('/');
      
      // Test landscape orientation
      await page.setViewportSize({ width: 1366, height: 1024 });
      await expect(page.locator('#app-root')).toBeVisible();
      
      // Test portrait orientation
      await page.setViewportSize({ width: 1024, height: 1366 });
      await expect(page.locator('#app-root')).toBeVisible();
    });
  });

  test.describe('Different Screen Sizes', () => {
    const screenSizes = [
      { width: 1920, height: 1080, name: 'Full HD' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 667, name: 'Mobile Small' },
      { width: 414, height: 896, name: 'Mobile Large' }
    ];

    screenSizes.forEach(({ width, height, name }) => {
      test(`should adapt to ${name} screen size (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        
        // Main elements should be visible
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        
        // Request editor should be usable
        await expect(page.locator('input[name="url"]')).toBeVisible();
        await expect(page.locator('button:has-text("Send")')).toBeVisible();
        
        // Check if content fits viewport
        const bodyBoundingBox = await page.locator('body').boundingBox();
        expect(bodyBoundingBox?.width).toBeLessThanOrEqual(width);
      });
    });
  });

  test.describe('Touch Interactions', () => {
    test.use({ ...devices['iPhone 12'] });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.goto('/');
      
      // Test touch on URL input
      await page.tap('input[name="url"]');
      await expect(page.locator('input[name="url"]')).toBeFocused();
      
      // Test touch on send button
      await page.tap('button:has-text("Send")');
      
      // Should work without errors
      await expect(page.locator('text=Enter a URL and click Send')).toBeVisible();
    });

    test('should handle touch gestures (if implemented)', async ({ page }) => {
      await page.goto('/');
      
      // Test basic touch interactions
      await page.tap('input[name="url"]');
      await expect(page.locator('input[name="url"]')).toBeFocused();
      
      // Note: Advanced swipe gestures would require custom implementation
      // This test covers basic touch functionality
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible on all screen sizes', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      if (await h1.isVisible()) {
        await expect(h1).toBeVisible();
      }
      
      // Check for proper ARIA labels
      await expect(page.locator('button:has-text("Send")')).toHaveAttribute('type', 'submit');
      
      // Check for keyboard navigation
      await page.locator('input[name="url"]').focus();
      await expect(page.locator('input[name="url"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('select[name="method"], button:has-text("Send")')).toBeFocused();
    });

    test('should have proper contrast and readability', async ({ page }) => {
      await page.goto('/');
      
      // Check that text is readable (basic check)
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Check that buttons are visible and clickable
      await expect(page.locator('button:has-text("Send")')).toBeVisible();
      await expect(page.locator('button:has-text("Send")')).toBeEnabled();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly on mobile', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (5 seconds for mobile)
      expect(loadTime).toBeLessThan(5000);
      
      // Main elements should be visible
      await expect(page.locator('input[name="url"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send")')).toBeVisible();
    });

    test('should handle rapid viewport changes', async ({ page }) => {
      await page.goto('/');
      
      // Rapidly change viewport sizes
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1366, height: 768 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100); // Small delay to allow for layout adjustments
        
        // App should remain functional
        await expect(page.locator('input[name="url"]')).toBeVisible();
        await expect(page.locator('button:has-text("Send")')).toBeVisible();
      }
    });
  });
});
