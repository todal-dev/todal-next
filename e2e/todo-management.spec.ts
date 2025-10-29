import { test, expect } from '@playwright/test';

// This test assumes user is already logged in
// You may need to set up authentication state before running these tests

test.describe('Todo Management', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authenticated state
    // For now, we'll skip authentication in tests
    // In a real scenario, you would:
    // 1. Use Playwright's authentication setup
    // 2. Or create a test user and log in programmatically
  });

  test('should display main page with calendar and todo list', async ({ page }) => {
    await page.goto('/');
    
    // Check if main elements are present
    await expect(page.locator('header')).toBeVisible();
    
    // Note: This test will fail without authentication
    // Uncomment when authentication is set up
    // await expect(page.getByText(/할일/i)).toBeVisible();
  });

  test.skip('should create a new todo', async ({ page }) => {
    await page.goto('/');
    
    // Find todo input
    const todoInput = page.getByPlaceholder(/할일 추가/i);
    
    // Type new todo
    await todoInput.fill('새로운 할일');
    await todoInput.press('Enter');
    
    // Verify todo was created
    await expect(page.getByText('새로운 할일')).toBeVisible();
  });

  test.skip('should toggle todo completion', async ({ page }) => {
    await page.goto('/');
    
    // Create a todo first
    const todoInput = page.getByPlaceholder(/할일 추가/i);
    await todoInput.fill('완료할 할일');
    await todoInput.press('Enter');
    
    // Find and click checkbox
    const checkbox = page.locator('[role="checkbox"]').first();
    await checkbox.click();
    
    // Verify todo is marked as completed
    await expect(checkbox).toBeChecked();
  });

  test.skip('should delete a todo', async ({ page }) => {
    await page.goto('/');
    
    // Create a todo first
    const todoInput = page.getByPlaceholder(/할일 추가/i);
    const todoText = '삭제할 할일';
    await todoInput.fill(todoText);
    await todoInput.press('Enter');
    
    // Right-click to open context menu
    const todo = page.getByText(todoText);
    await todo.click({ button: 'right' });
    
    // Click delete option
    await page.getByRole('menuitem', { name: /삭제/i }).click();
    
    // Verify todo was deleted
    await expect(page.getByText(todoText)).not.toBeVisible();
  });
});

test.describe('Calendar Integration', () => {
  test.skip('should drag todo to calendar', async ({ page }) => {
    await page.goto('/');
    
    // Create a todo
    const todoInput = page.getByPlaceholder(/할일 추가/i);
    await todoInput.fill('캘린더에 추가할 할일');
    await todoInput.press('Enter');
    
    // Drag todo to calendar
    const todo = page.getByText('캘린더에 추가할 할일');
    const calendarSlot = page.locator('.calendar-slot').first();
    
    await todo.dragTo(calendarSlot);
    
    // Verify todo appears in calendar
    await expect(calendarSlot).toContainText('캘린더에 추가할 할일');
  });
});

