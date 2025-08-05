import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation after successful login
    await page.waitForURL('/', { timeout: 10000 });
    
    // Check if user is logged in (look for logout button or user info)
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await page.waitForURL('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});