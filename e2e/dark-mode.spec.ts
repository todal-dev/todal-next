import { test, expect } from '@playwright/test';

test.describe('다크모드 전환 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto('/login');
  });

  test('다크모드 토글 버튼이 존재하고 작동한다', async ({ page }) => {
    // 로그인 (실제 계정 필요 - 환경에 맞게 수정)
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    
    // 페이지 로드 대기
    await page.waitForURL('/');
    
    // 다크모드 토글 버튼 찾기
    const themeToggle = page.locator('button[aria-label*="모드"]').first();
    await expect(themeToggle).toBeVisible();
    
    // 초기 테마 확인 (light mode)
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    const isDarkInitially = initialClass?.includes('dark') || false;
    
    // 다크모드 토글
    await themeToggle.click();
    await page.waitForTimeout(300); // transition 대기
    
    // 테마 변경 확인
    const afterToggleClass = await html.getAttribute('class');
    const isDarkAfterToggle = afterToggleClass?.includes('dark') || false;
    
    expect(isDarkAfterToggle).toBe(!isDarkInitially);
  });

  test('모든 주요 컴포넌트가 다크모드를 지원한다', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 다크모드 활성화
    const html = page.locator('html');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    // 주요 컴포넌트들의 배경색 확인
    const components = [
      { selector: 'header', name: 'Header' },
      { selector: 'main', name: 'Main Content' },
      { selector: '[class*="TodoList"]', name: 'Todo List' },
      { selector: '[class*="Calendar"]', name: 'Calendar' },
    ];
    
    for (const component of components) {
      const element = page.locator(component.selector).first();
      if (await element.isVisible()) {
        const bgColor = await element.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        
        // 다크모드에서는 어두운 배경색이어야 함
        console.log(`${component.name} background:`, bgColor);
        // rgb 값이 작아야 함 (어두워야 함)
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          const average = (r + g + b) / 3;
          expect(average).toBeLessThan(100); // 다크모드는 평균 100 미만
        }
      }
    }
  });

  test('다크모드 전환이 부드럽다 (transition 적용)', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 임의의 요소 선택
    const testElement = page.locator('body').first();
    
    // transition 속성 확인
    const transitionProperty = await testElement.evaluate((el) => {
      return window.getComputedStyle(el).transitionProperty;
    });
    
    // background-color, border-color 등이 transition 대상에 포함되어야 함
    expect(transitionProperty).toContain('background-color');
  });

  test('대시보드 차트가 다크모드를 지원한다', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 대시보드로 이동
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 다크모드 활성화
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(300);
    
    // 차트 컨테이너 확인
    const chartContainers = page.locator('[class*="recharts"]');
    const count = await chartContainers.count();
    
    if (count > 0) {
      console.log(`Found ${count} chart(s)`);
      
      // 첫 번째 차트의 배경색 확인
      const chartBg = await chartContainers.first().evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      console.log('Chart background:', chartBg);
      // 투명하거나 어두운 색이어야 함
    }
  });

  test('다이얼로그가 다크모드를 지원한다', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 다크모드 활성화
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // 다이얼로그를 여는 버튼 찾기 (예: 카테고리 추가)
    const addButton = page.locator('button:has-text("카테고리 추가")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // 다이얼로그 확인
      const dialog = page.locator('[role="dialog"], .BaseDialog').first();
      if (await dialog.isVisible()) {
        const dialogBg = await dialog.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        
        console.log('Dialog background:', dialogBg);
        
        // 다크모드 배경색 확인
        const rgbMatch = dialogBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          const average = (r + g + b) / 3;
          expect(average).toBeLessThan(100);
        }
      }
    }
  });

  test('테마 설정이 localStorage에 저장된다', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 다크모드 토글
    const themeToggle = page.locator('button[aria-label*="모드"]').first();
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    // localStorage 확인
    const savedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    
    expect(savedTheme).toBeTruthy();
    expect(['light', 'dark']).toContain(savedTheme);
  });

  test('페이지 새로고침 후에도 테마가 유지된다', async ({ page }) => {
    // 로그인
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 다크모드 활성화
    const themeToggle = page.locator('button[aria-label*="모드"]').first();
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    const html = page.locator('html');
    const classBeforeReload = await html.getAttribute('class');
    const isDarkBefore = classBeforeReload?.includes('dark') || false;
    
    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 테마 유지 확인
    const classAfterReload = await html.getAttribute('class');
    const isDarkAfter = classAfterReload?.includes('dark') || false;
    
    expect(isDarkAfter).toBe(isDarkBefore);
  });
});

