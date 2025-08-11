import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if signup form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/signup');
    
    const timestamp = Date.now();
    const newEmail = `newuser${timestamp}@example.com`;
    
    // Fill in registration form
    await page.fill('input[name="email"]', newEmail);
    await page.fill('input[name="password"]', 'NewPass123!');
    await page.fill('input[name="confirmPassword"]', 'NewPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill in registration form with mismatched passwords
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill in registration form with invalid email
    await page.fill('input[name="email"]', 'invalidemail');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check that the form was not submitted (browser validation)
    // The page should still be on /signup
    await expect(page).toHaveURL('/signup');
    // Check that email input has validation error
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill in registration form with weak password
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
});