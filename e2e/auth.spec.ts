import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login page elements are present
    await expect(page.getByRole('heading', { name: /Todal에 오신 것을 환영합니다/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google로 계속하기/i })).toBeVisible();
  });

  test('should show email login form when clicked', async ({ page }) => {
    await page.goto('/login');
    
    // Click email login button
    await page.getByRole('button', { name: /이메일로 로그인/i }).click();
    
    // Check if email form appears
    await expect(page.getByPlaceholder(/이메일/i)).toBeVisible();
    await expect(page.getByPlaceholder(/비밀번호/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Show email form
    await page.getByRole('button', { name: /이메일로 로그인/i }).click();
    
    // Enter invalid email
    await page.getByPlaceholder(/이메일/i).fill('invalid-email');
    await page.getByPlaceholder(/비밀번호/i).fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /이메일로 로그인/i, exact: true }).click();
    
    // Check for error message
    await expect(page.getByText(/올바른 이메일 주소를 입력해주세요/i)).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/login');
    
    // Show email form
    await page.getByRole('button', { name: /이메일로 로그인/i }).click();
    
    // Enter valid email but short password
    await page.getByPlaceholder(/이메일/i).fill('user@example.com');
    await page.getByPlaceholder(/비밀번호/i).fill('12345');
    
    // Submit form
    await page.getByRole('button', { name: /이메일로 로그인/i, exact: true }).click();
    
    // Check for error message
    await expect(page.getByText(/비밀번호는 최소 6자 이상이어야 합니다/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Click signup link
    await page.getByRole('link', { name: /회원가입/i }).click();
    
    // Check if navigated to signup page
    await expect(page).toHaveURL('/signup');
  });
});

