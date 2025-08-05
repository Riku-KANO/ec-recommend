import { test, expect } from '@playwright/test';

test.describe('Authentication - Real App', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check if login form elements are present
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message (Japanese)
    await expect(page.locator('text=ログインに失敗しました')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click on signup link
    await page.click('a[href="/auth/signup"]');
    
    // Should navigate to signup page
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access the home page
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/signin');
  });
});