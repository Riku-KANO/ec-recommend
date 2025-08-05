import { test, expect } from '@playwright/test';

test.describe('User Registration - Real App', () => {
  test('should display signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check if signup form elements are present
    await expect(page.locator('h1:has-text("新規登録")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill in registration form with mismatched passwords
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.fill('input[placeholder*="確認"]', 'DifferentPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible({ timeout: 5000 });
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill in registration form with weak password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.fill('input[placeholder*="確認"]', '123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=パスワードは8文字以上で入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Click on signin link
    await page.click('a[href="/auth/signin"]');
    
    // Should navigate to signin page
    await expect(page).toHaveURL('/auth/signin');
  });
});